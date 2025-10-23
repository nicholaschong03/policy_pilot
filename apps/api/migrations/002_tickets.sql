CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic ticket info
    source TEXT NOT NULL DEFAULT 'customer',
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    email TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,

    -- AI triage outputs
    predicted_category TEXT,
    priority TEXT CHECK (priority IN ('High','Medium','Low')),
    confidence REAL,
    suggested_reply TEXT,
    action TEXT CHECK (action IN ('AUTO_ACK_ONLY','AUTO_RESOLVE','ESCALATE','MANUAL')),

    -- Ticket state
    status TEXT NOT NULL DEFAULT 'untriaged'
      CHECK (status IN ('untriaged','active','resolved','escalated',
                        'breached_first_response','breached_resolution')),
    assigned_to TEXT,
    queue TEXT,

    -- SLA fields
    first_response_due TIMESTAMPTZ,
    resolution_due TIMESTAMPTZ,
    escalation_due TIMESTAMPTZ,
    first_response_sent_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    escalated_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);


