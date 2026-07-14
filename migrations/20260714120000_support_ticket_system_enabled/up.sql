ALTER TABLE ext_support_ticket_settings
    ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT TRUE;
