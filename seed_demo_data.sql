-- CLEANUP (Optional: Only run if you want to clear existing demo data)
-- TRUNCATE clients, updates, issues RESTART IDENTITY CASCADE;

-- 1. ADD REALISTIC PROJECTS
INSERT INTO clients (name, description, status, deadline, links) VALUES
('E-Commerce App Redesign', 'Revamping the core checkout flow and product listing pages for improved conversion.', 'on-track', CURRENT_DATE + INTERVAL '14 days', '{"figma": "https://figma.com/example", "staging": "https://staging.example.com"}'),
('Payment Gateway Integration', 'Integrating Razorpay and Stripe for seamless international transactions.', 'blocked', CURRENT_DATE + INTERVAL '5 days', '{}'),
('Mobile App v2.0', 'Developing the React Native version of the client portal with push notifications.', 'waiting', CURRENT_DATE + INTERVAL '30 days', '{"docs": "https://notion.so/docs"}'),
('Cloud Migration', 'Moving legacy on-premise servers to AWS with auto-scaling infrastructure.', 'on-track', CURRENT_DATE + INTERVAL '60 days', '{}');

-- 2. ADD REALISTIC UPDATES (Include Next Actions)
INSERT INTO updates (client_id, update_text, next_action, responsible_person) VALUES
-- E-Commerce
((SELECT id FROM clients WHERE name = 'E-Commerce App Redesign' LIMIT 1), 'UI mocks for the checkout page have been finalized and approved by the design lead.', 'Begin frontend implementation of the checkout grid.', 'Karthik'),
-- Payment Gateway
((SELECT id FROM clients WHERE name = 'Payment Gateway Integration' LIMIT 1), 'API keys received but the sandbox environment is returning a 503 error consistently.', 'Escalate to Razorpay support team for environment verification.', 'Admin'),
-- Mobile App
((SELECT id FROM clients WHERE name = 'Mobile App v2.0' LIMIT 1), 'Initial setup of React Native project is complete. Navigation architecture is being drafted.', 'Submit navigation flow for client review.', 'Karthik');

-- 3. ADD REALISTIC ISSUES
INSERT INTO issues (client_id, title, description, status, priority) VALUES
-- Payment Gateway (Blocked)
((SELECT id FROM clients WHERE name = 'Payment Gateway Integration' LIMIT 1), 'Payment API failure', 'Razorpay sandbox returns 503 Service Unavailable for all test transactions.', 'open', 'high'),
-- Mobile App (At Risk)
((SELECT id FROM clients WHERE name = 'Mobile App v2.0' LIMIT 1), 'Notification delay', 'Push notifications are arriving with a 5-minute delay on iOS devices.', 'in-progress', 'medium');
