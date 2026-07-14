use compact_str::CompactString;
use serde::{Deserialize, Serialize};
use shared::{State, extensions::ExtensionUpdateInfo};

const REPO: &str = "Luxxy-Hosting/Support-System";
const CACHE_KEY: &str = "dev.luxxy.supportsystem::latest-release";
const CACHE_TTL_SECONDS: u64 = 60 * 60;

#[derive(Clone, Serialize, Deserialize)]
struct GithubRelease {
    tag_name: String,
    name: Option<String>,
    body: Option<String>,
    #[serde(default)]
    draft: bool,
    #[serde(default)]
    prerelease: bool,
}

pub async fn check_for_updates(
    state: State,
    current_version: &semver::Version,
) -> Result<Option<ExtensionUpdateInfo>, anyhow::Error> {
    let client = state.client.clone();
    let releases: Vec<GithubRelease> = state
        .cache
        .cached(CACHE_KEY, CACHE_TTL_SECONDS, || async move {
            let releases = client
                .get(format!("https://api.github.com/repos/{REPO}/releases"))
                .send()
                .await?
                .error_for_status()?
                .json::<Vec<GithubRelease>>()
                .await?;

            Ok::<_, anyhow::Error>(releases)
        })
        .await?;

    let mut newer_releases: Vec<(semver::Version, GithubRelease)> = releases
        .into_iter()
        .filter(|release| !release.draft && !release.prerelease)
        .filter_map(|release| {
            let version = semver::Version::parse(release.tag_name.trim_start_matches('v')).ok()?;
            (version > *current_version).then_some((version, release))
        })
        .collect();

    if newer_releases.is_empty() {
        return Ok(None);
    }

    newer_releases.sort_by(|(a, _), (b, _)| a.cmp(b));

    let latest_version = newer_releases
        .last()
        .map(|(version, _)| version.clone())
        .expect("newer_releases is non-empty");

    let changes = newer_releases
        .iter()
        .flat_map(|(version, release)| release_changelog_lines(version, release))
        .collect();

    Ok(Some(ExtensionUpdateInfo {
        version: latest_version,
        changes,
    }))
}

fn release_changelog_lines(
    version: &semver::Version,
    release: &GithubRelease,
) -> Vec<CompactString> {
    let bullet_lines: Vec<CompactString> = release
        .body
        .as_deref()
        .unwrap_or_default()
        .lines()
        .map(str::trim)
        .filter_map(|line| {
            line.strip_prefix('-')
                .or_else(|| line.strip_prefix('*'))
                .map(str::trim)
                .filter(|value| !value.is_empty())
        })
        .map(|line| CompactString::from(format!("v{version} — {line}")))
        .collect();

    if !bullet_lines.is_empty() {
        return bullet_lines;
    }

    let summary = release
        .name
        .as_deref()
        .map(str::trim)
        .filter(|name| !name.is_empty())
        .unwrap_or(release.tag_name.as_str());

    vec![CompactString::from(format!("v{version} — {summary}"))]
}
