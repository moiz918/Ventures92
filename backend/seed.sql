BEGIN;

-- ==========================================
-- 1. USERS
-- ==========================================
INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, role, is_active) VALUES
-- SUPER ADMINS
('a1b2c3d4-e5f6-7890-1234-56789abcdef0', 'admin@ventures92.com', '$2b$12$dummyhash12345678901234', 'Saad', 'Ather', '+923001234567', 'SUPER_ADMIN', TRUE),
('a1b2c3d4-e5f6-7890-1234-56789abcdef1', 'manzer@ventures92.com', '$2b$12$dummyhash12345678901234', 'Manzer', 'Abbas', '+923211234567', 'SUPER_ADMIN', TRUE),
('a1b2c3d4-e5f6-7890-1234-56789abcdef2', 'daniyal@ventures92.com', '$2b$12$dummyhash12345678901234', 'Daniyal', 'Zaidi', '+923331234567', 'SUPER_ADMIN', TRUE),
('a1b2c3d4-e5f6-7890-1234-56789abcdef3', 'moiz@ventures92.com', '$2b$12$dummyhash12345678901234', 'Abdul', 'Moiz', '+923451234567', 'SUPER_ADMIN', TRUE),
-- AGENTS
('b1c2d3e4-f5a6-7890-1234-56789abcdef0', 'agent.ali@ventures92.com', '$2b$12$dummyhash12345678901234', 'Ali', 'Raza', '+923019876543', 'AGENT', TRUE),
('b1c2d3e4-f5a6-7890-1234-56789abcdef1', 'agent.sara@ventures92.com', '$2b$12$dummyhash12345678901234', 'Sara', 'Khan', '+923229876543', 'AGENT', TRUE),
('b1c2d3e4-f5a6-7890-1234-56789abcdef2', 'agent.usman@ventures92.com', '$2b$12$dummyhash12345678901234', 'Usman', 'Tariq', '+923349876543', 'AGENT', TRUE),
('b1c2d3e4-f5a6-7890-1234-56789abcdef3', 'agent.fatima@ventures92.com', '$2b$12$dummyhash12345678901234', 'Fatima', 'Zehra', '+923469876543', 'AGENT', TRUE),
-- INVESTORS
('c1d2e3f4-a5b6-7890-1234-56789abcdef0', 'investor.bilal@gmail.com', '$2b$12$dummyhash12345678901234', 'Bilal', 'Ahmed', '+923051112223', 'INVESTOR', TRUE),
('c1d2e3f4-a5b6-7890-1234-56789abcdef1', 'zainab.invest@yahoo.com', '$2b$12$dummyhash12345678901234', 'Zainab', 'Malik', '+923231112223', 'INVESTOR', TRUE),
('c1d2e3f4-a5b6-7890-1234-56789abcdef2', 'kamran.shah@outlook.com', '$2b$12$dummyhash12345678901234', 'Kamran', 'Shah', '+923351112223', 'INVESTOR', TRUE),
('c1d2e3f4-a5b6-7890-1234-56789abcdef3', 'nadia.capital@gmail.com', '$2b$12$dummyhash12345678901234', 'Nadia', 'Hussain', '+923471112223', 'INVESTOR', TRUE),
('c1d2e3f4-a5b6-7890-1234-56789abcdef4', 'omar.investments@corp.pk', '$2b$12$dummyhash12345678901234', 'Omar', 'Farooq', '+923005556667', 'INVESTOR', TRUE),
-- BUYER/TENANTS
('d1e2f3a4-b5c6-7890-1234-56789abcdef0', 'buyer.hassan@gmail.com', '$2b$12$dummyhash12345678901234', 'Hassan', 'Javed', '+923014445556', 'BUYER_TENANT', TRUE),
('d1e2f3a4-b5c6-7890-1234-56789abcdef1', 'ayesha.home@yahoo.com', '$2b$12$dummyhash12345678901234', 'Ayesha', 'Iqbal', '+923224445556', 'BUYER_TENANT', TRUE),
('d1e2f3a4-b5c6-7890-1234-56789abcdef2', 'fahad.tenant@gmail.com', '$2b$12$dummyhash12345678901234', 'Fahad', 'Mustafa', '+923334445556', 'BUYER_TENANT', TRUE),
('d1e2f3a4-b5c6-7890-1234-56789abcdef3', 'sana.buyer@outlook.com', '$2b$12$dummyhash12345678901234', 'Sana', 'Mir', '+923454445556', 'BUYER_TENANT', TRUE),
('d1e2f3a4-b5c6-7890-1234-56789abcdef4', 'waleed.k@gmail.com', '$2b$12$dummyhash12345678901234', 'Waleed', 'Khalid', '+923007778889', 'BUYER_TENANT', TRUE),
('d1e2f3a4-b5c6-7890-1234-56789abcdef5', 'rabia.s@yahoo.com', '$2b$12$dummyhash12345678901234', 'Rabia', 'Sheikh', '+923217778889', 'BUYER_TENANT', TRUE),
('d1e2f3a4-b5c6-7890-1234-56789abcdef6', 'imran.b@outlook.com', '$2b$12$dummyhash12345678901234', 'Imran', 'Bhatti', '+923337778889', 'BUYER_TENANT', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. SITE SETTINGS
-- ==========================================
INSERT INTO site_settings (id, setting_key, setting_value, description) VALUES
('b1b2c3d4-e5f6-7890-1234-56789abcdef0', 'GLOBAL_WHATSAPP_NUMBER', '+923001234567', 'The primary WhatsApp number displayed on the portal for quick inquiries.'),
('b1b2c3d4-e5f6-7890-1234-56789abcdef1', 'GLOBAL_CALL_NUMBER', '+924231234567', 'The primary landline/mobile number for direct calls.'),
('b1b2c3d4-e5f6-7890-1234-56789abcdef2', 'SUPPORT_EMAIL', 'support@ventures92.com', 'General inquiries email address.'),
('b1b2c3d4-e5f6-7890-1234-56789abcdef3', 'FACEBOOK_LINK', 'https://facebook.com/ventures92', 'Link to official Facebook page.'),
('b1b2c3d4-e5f6-7890-1234-56789abcdef4', 'INSTAGRAM_LINK', 'https://instagram.com/ventures92_official', 'Link to official Instagram page.'),
('b1b2c3d4-e5f6-7890-1234-56789abcdef5', 'OFFICE_ADDRESS', '12-A, Commercial Area, DHA Phase 6, Lahore', 'Physical office address for the footer.')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 3. CORPORATE PARTNERS
-- ==========================================
INSERT INTO corporate_partners (id, name, logo_url, website_url, is_active, display_order) VALUES
('e1f2a3b4-c5d6-7890-1234-56789abcdef0', 'DHA Lahore', 'https://dummyimage.com/200x100/eeeeee/333333&text=DHA+Lahore', 'https://dhalahore.org', TRUE, 1),
('e1f2a3b4-c5d6-7890-1234-56789abcdef1', 'Bahria Town', 'https://dummyimage.com/200x100/eeeeee/333333&text=Bahria+Town', 'https://bahriatown.com', TRUE, 2),
('e1f2a3b4-c5d6-7890-1234-56789abcdef2', 'Zameen.com', 'https://dummyimage.com/200x100/eeeeee/333333&text=Zameen', 'https://zameen.com', TRUE, 3),
('e1f2a3b4-c5d6-7890-1234-56789abcdef3', 'Meezan Bank', 'https://dummyimage.com/200x100/eeeeee/333333&text=Meezan+Bank', 'https://meezanbank.com', TRUE, 4),
('e1f2a3b4-c5d6-7890-1234-56789abcdef4', 'Habib Bank Limited (HBL)', 'https://dummyimage.com/200x100/eeeeee/333333&text=HBL', 'https://hbl.com', TRUE, 5),
('e1f2a3b4-c5d6-7890-1234-56789abcdef5', 'Izhar Construction', 'https://dummyimage.com/200x100/eeeeee/333333&text=Izhar+Grp', 'https://izhar.com', TRUE, 6)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. LOCATIONS
-- ==========================================
INSERT INTO locations (id, city, region_or_society, latitude, longitude) VALUES
('f1a2b3c4-d5e6-7890-1234-56789abcdef0', 'Lahore', 'DHA Phase 6', 31.4746, 74.4554),
('f1a2b3c4-d5e6-7890-1234-56789abcdef1', 'Lahore', 'DHA Phase 8', 31.4883, 74.4712),
('f1a2b3c4-d5e6-7890-1234-56789abcdef2', 'Lahore', 'Bahria Town', 31.3653, 74.1843),
('f1a2b3c4-d5e6-7890-1234-56789abcdef3', 'Lahore', 'Gulberg III', 31.5102, 74.3441),
('f1a2b3c4-d5e6-7890-1234-56789abcdef4', 'Islamabad', 'DHA Phase 2', 33.5226, 73.1491),
('f1a2b3c4-d5e6-7890-1234-56789abcdef5', 'Islamabad', 'Bahria Town Phase 7', 33.5312, 73.1111),
('f1a2b3c4-d5e6-7890-1234-56789abcdef6', 'Islamabad', 'Sector F-8', 33.7088, 73.0397),
('f1a2b3c4-d5e6-7890-1234-56789abcdef7', 'Karachi', 'DHA Phase 8', 24.7937, 67.0422),
('f1a2b3c4-d5e6-7890-1234-56789abcdef8', 'Karachi', 'Bahria Town Karachi', 25.1091, 67.3195),
('f1a2b3c4-d5e6-7890-1234-56789abcdef9', 'Rawalpindi', 'Bahria Town Phase 8', 33.4866, 73.0805)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 5. PROJECTS
-- ==========================================
INSERT INTO projects (id, location_id, title, slug, description, status, launch_date) VALUES
('01a2b3c4-d5e6-7890-1234-56789abcdef0', 'f1a2b3c4-d5e6-7890-1234-56789abcdef0', 'Ventures 92 Residencia', 'ventures-92-residencia', 'A state-of-the-art luxury apartment complex in the heart of DHA Phase 6.', 'UNDER_CONSTRUCTION', '2023-10-15'),
('01a2b3c4-d5e6-7890-1234-56789abcdef1', 'f1a2b3c4-d5e6-7890-1234-56789abcdef3', 'Gulberg Heights', 'gulberg-heights-commercial', 'Premium commercial building situated in Gulberg III. Designed for corporate offices.', 'COMPLETED', '2022-01-10'),
('01a2b3c4-d5e6-7890-1234-56789abcdef2', 'f1a2b3c4-d5e6-7890-1234-56789abcdef8', 'Bahria Oasis Villas', 'bahria-oasis-villas-karachi', 'Exclusive gated community within Bahria Town Karachi, featuring 500 Sq Yard luxury villas.', 'PLANNING', '2024-09-01'),
('01a2b3c4-d5e6-7890-1234-56789abcdef3', 'f1a2b3c4-d5e6-7890-1234-56789abcdef6', 'Centaurus Annex', 'centaurus-annex-islamabad', 'An extension of the iconic commercial hub in Islamabad. Offering mixed-use spaces.', 'UNDER_CONSTRUCTION', '2023-05-20'),
('01a2b3c4-d5e6-7890-1234-56789abcdef4', 'f1a2b3c4-d5e6-7890-1234-56789abcdef1', 'DHA 8 Commercial Hub', 'dha-8-commercial-hub', 'A master-planned commercial sector in DHA Phase 8 Lahore.', 'COMPLETED', '2021-11-05'),
('01a2b3c4-d5e6-7890-1234-56789abcdef5', 'f1a2b3c4-d5e6-7890-1234-56789abcdef4', 'Islamabad Capital Enclave', 'islamabad-capital-enclave', 'A sprawling residential society offering flexible plot cuttings for custom home building.', 'PLANNING', '2025-02-15')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 6. PROJECT MILESTONES
-- ==========================================
INSERT INTO project_milestones (id, project_id, title, description, completion_percentage, status_update, milestone_date, media_url) VALUES
('11a2b3c4-d5e6-7890-1234-56789abcdef0', '01a2b3c4-d5e6-7890-1234-56789abcdef0', 'Groundbreaking Ceremony', 'Official groundbreaking and site clearing completed.', 10, 'EXCAVATION', '2023-11-01', 'https://images.unsplash.com/photo-1541888081622'),
('11a2b3c4-d5e6-7890-1234-56789abcdef1', '01a2b3c4-d5e6-7890-1234-56789abcdef0', 'Foundation Poured', 'Basement excavation and concrete foundation pouring completed.', 30, 'STRUCTURE', '2024-02-15', 'https://images.unsplash.com/photo-1503387762'),
('11a2b3c4-d5e6-7890-1234-56789abcdef2', '01a2b3c4-d5e6-7890-1234-56789abcdef0', 'Grey Structure Completion', 'All 12 floors of the grey structure have been erected.', 60, 'STRUCTURE', '2024-05-20', 'https://images.unsplash.com/photo-1504307651254'),
('11a2b3c4-d5e6-7890-1234-56789abcdef3', '01a2b3c4-d5e6-7890-1234-56789abcdef1', 'Interior Finishing', 'HVAC installation, tiling, and glass facade completed.', 90, 'FINISHING', '2022-10-01', 'https://images.unsplash.com/photo-1600585154340'),
('11a2b3c4-d5e6-7890-1234-56789abcdef4', '01a2b3c4-d5e6-7890-1234-56789abcdef1', 'Project Handover', 'Final inspections passed. Building is ready for possession by commercial tenants.', 100, 'DELIVERED', '2023-01-15', 'https://images.unsplash.com/photo-1486406146926'),
('11a2b3c4-d5e6-7890-1234-56789abcdef5', '01a2b3c4-d5e6-7890-1234-56789abcdef3', 'Excavation Phase', 'Deep excavation for the 4-level underground parking.', 20, 'EXCAVATION', '2023-08-10', 'https://images.unsplash.com/photo-1541888081622'),
('11a2b3c4-d5e6-7890-1234-56789abcdef6', '01a2b3c4-d5e6-7890-1234-56789abcdef3', 'Podium Level Complete', 'Construction of the retail podium level finished.', 45, 'STRUCTURE', '2024-03-05', 'https://images.unsplash.com/photo-1503387762')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 7. AMENITIES
-- ==========================================
INSERT INTO amenities (id, name, icon_name) VALUES
('21a2b3c4-d5e6-7890-1234-56789abcdef0', 'Sui Gas', 'Flame'),
('21a2b3c4-d5e6-7890-1234-56789abcdef1', 'Electricity (WAPDA)', 'Zap'),
('21a2b3c4-d5e6-7890-1234-56789abcdef2', 'Water Supply', 'Droplet'),
('21a2b3c4-d5e6-7890-1234-56789abcdef3', 'Backup Generator', 'BatteryCharging'),
('21a2b3c4-d5e6-7890-1234-56789abcdef4', 'Corner Plot', 'CornerUpRight'),
('21a2b3c4-d5e6-7890-1234-56789abcdef5', 'Park Facing', 'TreePine'),
('21a2b3c4-d5e6-7890-1234-56789abcdef6', 'Main Boulevard', 'Road'),
('21a2b3c4-d5e6-7890-1234-56789abcdef7', 'Swimming Pool', 'Waves'),
('21a2b3c4-d5e6-7890-1234-56789abcdef8', 'Gymnasium', 'Dumbbell'),
('21a2b3c4-d5e6-7890-1234-56789abcdef9', '24/7 Security', 'ShieldCheck'),
('21a2b3c4-d5e6-7890-1234-56789abcdefa', 'High-Speed Elevators', 'ArrowUpCircle'),
('21a2b3c4-d5e6-7890-1234-56789abcdefb', 'Covered Parking', 'Car'),
('21a2b3c4-d5e6-7890-1234-56789abcdefc', 'Central HVAC', 'Wind'),
('21a2b3c4-d5e6-7890-1234-56789abcdefd', 'Servant Quarters', 'User'),
('21a2b3c4-d5e6-7890-1234-56789abcdefe', 'Smart Home Integration', 'Wifi')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 8. PROPERTIES
-- ==========================================
INSERT INTO properties (id, project_id, title, slug, description, property_type, property_category, price, area_size, area_unit, bedrooms, bathrooms, address_details, is_featured, availability_status) VALUES
('31a2b3c4-d5e6-7890-1234-56789abcdef0', '01a2b3c4-d5e6-7890-1234-56789abcdef0', 'Luxury 3-Bed Apartment (Type A)', 'luxury-3-bed-apt-ventures-92-type-a', 'Spacious 3-bedroom apartment on the 5th floor.', 'RESIDENTIAL', 'APARTMENT', 45000000.00, 2200.00, 'SQ_FT', 3, 4, 'Apt 502, Tower A, DHA Phase 6, Lahore', TRUE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdef1', '01a2b3c4-d5e6-7890-1234-56789abcdef0', 'Premium 2-Bed Apartment', 'premium-2-bed-apt-ventures-92', 'Modern 2-bedroom layout with a balcony.', 'RESIDENTIAL', 'APARTMENT', 32000000.00, 1600.00, 'SQ_FT', 2, 2, 'Apt 305, Tower B, DHA Phase 6, Lahore', FALSE, 'RESERVED'),
('31a2b3c4-d5e6-7890-1234-56789abcdef2', '01a2b3c4-d5e6-7890-1234-56789abcdef0', 'Penthouse Suite', 'penthouse-suite-ventures-92', 'A 4-bedroom penthouse with exclusive rooftop terrace access.', 'RESIDENTIAL', 'APARTMENT', 120000000.00, 4500.00, 'SQ_FT', 4, 5, 'Penthouse 1, Tower A, DHA Phase 6, Lahore', TRUE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdef3', '01a2b3c4-d5e6-7890-1234-56789abcdef1', 'Ground Floor Retail Flagship', 'ground-floor-retail-gulberg-heights', 'High visibility corner retail space.', 'COMMERCIAL', 'SHOP', 180000000.00, 3000.00, 'SQ_FT', NULL, 2, 'Shop G-01, Gulberg Heights, Gulberg III', TRUE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdef4', '01a2b3c4-d5e6-7890-1234-56789abcdef1', 'Corporate Office Floor', 'corporate-office-floor-4-gulberg-heights', 'Entire 4th floor available for corporate headquarters.', 'COMMERCIAL', 'OFFICE', 250000000.00, 8000.00, 'SQ_FT', NULL, 4, 'Floor 4, Gulberg Heights, Gulberg III', FALSE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdef5', '01a2b3c4-d5e6-7890-1234-56789abcdef1', 'Executive Suite', 'executive-suite-level-8-gulberg-heights', 'Smaller office suite ideal for IT startups.', 'COMMERCIAL', 'OFFICE', 45000000.00, 1500.00, 'SQ_FT', NULL, 1, 'Suite 804, Gulberg Heights, Gulberg III', FALSE, 'SOLD'),
('31a2b3c4-d5e6-7890-1234-56789abcdef6', '01a2b3c4-d5e6-7890-1234-56789abcdef2', '1 Kanal Spanish Villa', '1-kanal-spanish-villa-bahria-karachi', 'Luxurious 1 Kanal house with 5 bedrooms.', 'RESIDENTIAL', 'HOUSE', 65000000.00, 1.00, 'KANAL', 5, 6, 'Villa 45, Block A, BTK, Karachi', TRUE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdef7', '01a2b3c4-d5e6-7890-1234-56789abcdef2', '10 Marla Modern Villa', '10-marla-modern-villa-bahria-karachi', 'Contemporary 10 Marla design featuring 4 bedrooms.', 'RESIDENTIAL', 'HOUSE', 38000000.00, 10.00, 'MARLA', 4, 5, 'Villa 112, Block B, BTK, Karachi', FALSE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdef8', NULL, '10 Marla Plot in DHA Phase 6', '10-marla-plot-dha-6-block-l', 'Prime location 10 Marla residential plot in Block L.', 'RESIDENTIAL', 'PLOT', 28000000.00, 10.00, 'MARLA', NULL, NULL, 'Plot 450, Block L, DHA Phase 6, Lahore', TRUE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdef9', NULL, '1 Kanal Park Facing Plot', '1-kanal-park-facing-plot-dha-8', 'Highly sought-after 1 Kanal plot facing a lush green park.', 'RESIDENTIAL', 'PLOT', 62000000.00, 1.00, 'KANAL', NULL, NULL, 'Plot 88, Block F, DHA Phase 8, Lahore', TRUE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdefa', NULL, '4 Marla Commercial Plot', '4-marla-commercial-plot-bahria-town', 'Excellent investment opportunity.', 'COMMERCIAL', 'PLOT', 40000000.00, 4.00, 'MARLA', NULL, NULL, 'Plot C-12, Sector C Commercial, Bahria Town', FALSE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdefb', NULL, 'Brand New 1 Kanal House', 'brand-new-1-kanal-house-dha-6', 'Owner-built 1 Kanal house with A+ grade construction.', 'RESIDENTIAL', 'HOUSE', 115000000.00, 1.00, 'KANAL', 5, 6, 'House 201, Block N, DHA Phase 6, Lahore', TRUE, 'AVAILABLE'),
('31a2b3c4-d5e6-7890-1234-56789abcdefc', NULL, '5 Marla House for Sale', '5-marla-house-bahria-town-lahore', 'Cozy and modern 5 Marla house in Sector E.', 'RESIDENTIAL', 'HOUSE', 22000000.00, 5.00, 'MARLA', 3, 3, 'House 55, Sector E, Bahria Town, Lahore', FALSE, 'RESERVED')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 9. PROPERTY MEDIA
-- ==========================================
INSERT INTO property_media (id, property_id, media_type, media_url, is_primary, sort_order) VALUES
('41a2b3c4-d5e6-7890-1234-56789abcdef0', '31a2b3c4-d5e6-7890-1234-56789abcdef0', 'IMAGE', 'https://images.unsplash.com/photo-1522708323590', TRUE, 1),
('41a2b3c4-d5e6-7890-1234-56789abcdef1', '31a2b3c4-d5e6-7890-1234-56789abcdef0', 'IMAGE', 'https://images.unsplash.com/photo-1502672260266', FALSE, 2),
('41a2b3c4-d5e6-7890-1234-56789abcdef2', '31a2b3c4-d5e6-7890-1234-56789abcdef0', 'FLOOR_PLAN', 'https://dummyimage.com/600x400', FALSE, 3),
('41a2b3c4-d5e6-7890-1234-56789abcdef3', '31a2b3c4-d5e6-7890-1234-56789abcdef1', 'IMAGE', 'https://images.unsplash.com/photo-1502005229762', TRUE, 1),
('41a2b3c4-d5e6-7890-1234-56789abcdef4', '31a2b3c4-d5e6-7890-1234-56789abcdef1', 'IMAGE', 'https://images.unsplash.com/photo-1560448204', FALSE, 2),
('41a2b3c4-d5e6-7890-1234-56789abcdef5', '31a2b3c4-d5e6-7890-1234-56789abcdef3', 'IMAGE', 'https://images.unsplash.com/photo-1582053433976', TRUE, 1),
('41a2b3c4-d5e6-7890-1234-56789abcdef6', '31a2b3c4-d5e6-7890-1234-56789abcdefb', 'IMAGE', 'https://images.unsplash.com/photo-1600596542815', TRUE, 1),
('41a2b3c4-d5e6-7890-1234-56789abcdef7', '31a2b3c4-d5e6-7890-1234-56789abcdefb', 'IMAGE', 'https://images.unsplash.com/photo-1600607687931', FALSE, 2),
('41a2b3c4-d5e6-7890-1234-56789abcdef8', '31a2b3c4-d5e6-7890-1234-56789abcdefb', 'IMAGE', 'https://images.unsplash.com/photo-1600566753086', FALSE, 3)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 10. PROPERTY AMENITIES
-- ==========================================
INSERT INTO property_amenities (property_id, amenity_id) VALUES
('31a2b3c4-d5e6-7890-1234-56789abcdef0', '21a2b3c4-d5e6-7890-1234-56789abcdef7'),
('31a2b3c4-d5e6-7890-1234-56789abcdef0', '21a2b3c4-d5e6-7890-1234-56789abcdef9'),
('31a2b3c4-d5e6-7890-1234-56789abcdef0', '21a2b3c4-d5e6-7890-1234-56789abcdefa'),
('31a2b3c4-d5e6-7890-1234-56789abcdef0', '21a2b3c4-d5e6-7890-1234-56789abcdefb'),
('31a2b3c4-d5e6-7890-1234-56789abcdef0', '21a2b3c4-d5e6-7890-1234-56789abcdef3'),
('31a2b3c4-d5e6-7890-1234-56789abcdef0', '21a2b3c4-d5e6-7890-1234-56789abcdefe'),
('31a2b3c4-d5e6-7890-1234-56789abcdefb', '21a2b3c4-d5e6-7890-1234-56789abcdef0'),
('31a2b3c4-d5e6-7890-1234-56789abcdefb', '21a2b3c4-d5e6-7890-1234-56789abcdef1'),
('31a2b3c4-d5e6-7890-1234-56789abcdefb', '21a2b3c4-d5e6-7890-1234-56789abcdef2'),
('31a2b3c4-d5e6-7890-1234-56789abcdefb', '21a2b3c4-d5e6-7890-1234-56789abcdefd'),
('31a2b3c4-d5e6-7890-1234-56789abcdef9', '21a2b3c4-d5e6-7890-1234-56789abcdef5'),
('31a2b3c4-d5e6-7890-1234-56789abcdef9', '21a2b3c4-d5e6-7890-1234-56789abcdef0'),
('31a2b3c4-d5e6-7890-1234-56789abcdef9', '21a2b3c4-d5e6-7890-1234-56789abcdef2')
ON CONFLICT (property_id, amenity_id) DO NOTHING;

-- ==========================================
-- 11. LEADS
-- ==========================================
INSERT INTO leads (id, property_id, user_id, first_name, last_name, email, phone, message, preferred_property_type, min_budget, max_budget, preferred_location, status, assigned_agent_id) VALUES
('51a2b3c4-d5e6-7890-1234-56789abcdef0', '31a2b3c4-d5e6-7890-1234-56789abcdef0', 'c1d2e3f4-a5b6-7890-1234-56789abcdef0', 'Bilal', 'Ahmed', 'investor.bilal@gmail.com', '+923051112223', 'I am interested in this 3-Bed apartment. Is the price negotiable?', 'RESIDENTIAL', NULL, NULL, NULL, 'IN_PROGRESS', 'b1c2d3e4-f5a6-7890-1234-56789abcdef0'),
('51a2b3c4-d5e6-7890-1234-56789abcdef1', '31a2b3c4-d5e6-7890-1234-56789abcdefb', NULL, 'Raza', 'Shah', 'raza.shah99@outlook.com', '+923215554443', 'Would like to schedule a viewing for this 1 Kanal house this weekend.', 'RESIDENTIAL', NULL, NULL, NULL, 'NEW', NULL),
('51a2b3c4-d5e6-7890-1234-56789abcdef2', NULL, 'c1d2e3f4-a5b6-7890-1234-56789abcdef1', 'Zainab', 'Malik', 'zainab.invest@yahoo.com', '+923231112223', 'Looking for commercial investment options. Prefer high rental yield.', 'COMMERCIAL', 50000000.00, 100000000.00, 'DHA Phase 6 or Gulberg', 'CONTACTED', 'b1c2d3e4-f5a6-7890-1234-56789abcdef1'),
('51a2b3c4-d5e6-7890-1234-56789abcdef3', NULL, 'd1e2f3a4-b5c6-7890-1234-56789abcdef0', 'Hassan', 'Javed', 'buyer.hassan@gmail.com', '+923014445556', 'Searching for a 5 Marla house for my family. Ready to move.', 'RESIDENTIAL', 15000000.00, 25000000.00, 'Bahria Town Lahore', 'QUALIFIED', 'b1c2d3e4-f5a6-7890-1234-56789abcdef2'),
('51a2b3c4-d5e6-7890-1234-56789abcdef4', NULL, NULL, 'Saqib', 'Rana', 'saqib.rana@gmail.com', '+923338887776', 'I need a 10 Marla plot for construction in a secure society.', 'RESIDENTIAL', 20000000.00, 30000000.00, 'DHA or Bahria', 'NEW', NULL),
('51a2b3c4-d5e6-7890-1234-56789abcdef5', '31a2b3c4-d5e6-7890-1234-56789abcdef4', 'c1d2e3f4-a5b6-7890-1234-56789abcdef4', 'Omar', 'Farooq', 'omar.investments@corp.pk', '+923005556667', 'Can you provide the floor plans and ROI projections for this office space?', 'COMMERCIAL', NULL, NULL, NULL, 'CLOSED', 'b1c2d3e4-f5a6-7890-1234-56789abcdef0')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 12. LEAD INTERACTIONS
-- ==========================================
INSERT INTO lead_interactions (id, lead_id, agent_id, interaction_type, summary) VALUES
('61a2b3c4-d5e6-7890-1234-56789abcdef0', '51a2b3c4-d5e6-7890-1234-56789abcdef0', 'b1c2d3e4-f5a6-7890-1234-56789abcdef0', 'CALL', 'Called client. Discussed pricing and payment plan. He is visiting the site tomorrow.'),
('61a2b3c4-d5e6-7890-1234-56789abcdef1', '51a2b3c4-d5e6-7890-1234-56789abcdef0', 'b1c2d3e4-f5a6-7890-1234-56789abcdef0', 'MEETING', 'Met at the site. Client loved the finishing. Requested a 5% discount.'),
('61a2b3c4-d5e6-7890-1234-56789abcdef2', '51a2b3c4-d5e6-7890-1234-56789abcdef2', 'b1c2d3e4-f5a6-7890-1234-56789abcdef1', 'EMAIL', 'Emailed a portfolio of 3 commercial properties in Gulberg and DHA matching her budget.'),
('61a2b3c4-d5e6-7890-1234-56789abcdef3', '51a2b3c4-d5e6-7890-1234-56789abcdef2', 'b1c2d3e4-f5a6-7890-1234-56789abcdef1', 'NOTE', 'Client prefers Gulberg Heights due to higher guaranteed rental yield.'),
('61a2b3c4-d5e6-7890-1234-56789abcdef4', '51a2b3c4-d5e6-7890-1234-56789abcdef3', 'b1c2d3e4-f5a6-7890-1234-56789abcdef2', 'CALL', 'Qualified the lead. He has pre-approved financing. Arranging viewings for Saturday.')
ON CONFLICT (id) DO NOTHING;

COMMIT;
