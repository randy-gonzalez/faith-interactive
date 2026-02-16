-- Seed ChurchPartner data for local development
INSERT INTO "ChurchPartner" (id, name, slug, "logoUrl", "websiteUrl", "isActive", "sortOrder", "createdAt", "updatedAt") VALUES
('cp_01', 'Calvary Chapel Downey', 'calvary-chapel-downey', 'https://assets.faith-interactive.com/church-partners/calvary-chapel-downey.png', NULL, true, 0, NOW(), NOW()),
('cp_02', 'Harvest Crusades', 'harvest-crusades', 'https://assets.faith-interactive.com/church-partners/harvest-crusades.png', NULL, true, 1, NOW(), NOW()),
('cp_03', 'CHEA', 'chea', 'https://assets.faith-interactive.com/church-partners/chea.png', NULL, true, 2, NOW(), NOW()),
('cp_04', 'Kerusso', 'kerusso', 'https://assets.faith-interactive.com/church-partners/kerusso.png', NULL, true, 3, NOW(), NOW()),
('cp_05', 'Redeemer City Church', 'redeemer-city-church', 'https://assets.faith-interactive.com/church-partners/redeemer-city-church.png', NULL, true, 4, NOW(), NOW()),
('cp_06', 'Calvary Chapel Golden Springs', 'calvary-chapel-golden-springs', 'https://assets.faith-interactive.com/church-partners/calvary-chapel-golden-springs.png', NULL, true, 5, NOW(), NOW()),
('cp_07', 'Calvary Chapel Santa Fe Springs', 'calvary-chapel-santa-fe-springs', 'https://assets.faith-interactive.com/church-partners/calvary-chapel-santa-fe-springs.png', NULL, true, 6, NOW(), NOW()),
('cp_08', 'Coaches of Influence', 'coaches-of-influence', 'https://assets.faith-interactive.com/church-partners/coaches-of-influence.png', NULL, true, 7, NOW(), NOW()),
('cp_09', 'The Sending Church', 'the-sending-church', 'https://assets.faith-interactive.com/church-partners/the-sending-church.png', NULL, true, 8, NOW(), NOW()),
('cp_10', 'New Life Christian Fellowship', 'new-life-christian-fellowship', 'https://assets.faith-interactive.com/church-partners/new-life-christian-fellowship.png', NULL, true, 9, NOW(), NOW()),
('cp_11', 'Calvary Chapel Ascend', 'calvary-chapel-ascend', 'https://assets.faith-interactive.com/church-partners/calvary-chapel-ascend.png', NULL, true, 10, NOW(), NOW()),
('cp_12', 'Calvary Chapel Inglewood', 'calvary-chapel-inglewood', 'https://assets.faith-interactive.com/church-partners/calvary-chapel-inglewood.png', NULL, true, 11, NOW(), NOW()),
('cp_13', 'Calvary Chapel Signal Hill', 'calvary-chapel-signal-hill', 'https://assets.faith-interactive.com/church-partners/calvary-chapel-signal-hill.png', NULL, true, 12, NOW(), NOW()),
('cp_14', 'Calvary Chapel Education Association', 'calvary-chapel-education-association', 'https://assets.faith-interactive.com/church-partners/calvary-chapel-education-association.png', NULL, true, 13, NOW(), NOW()),
('cp_15', 'Calvary Chapel University', 'calvary-chapel-university', 'https://assets.faith-interactive.com/church-partners/calvary-chapel-university.png', NULL, true, 14, NOW(), NOW()),
('cp_16', 'Calvary Boulder Valley', 'calvary-boulder-valley', 'https://assets.faith-interactive.com/church-partners/calvary-boulder-valley.png', NULL, true, 15, NOW(), NOW()),
('cp_17', 'Calvary Chapel Fellowship Foley', 'calvary-chapel-fellowship-foley', 'https://assets.faith-interactive.com/church-partners/calvary-chapel-fellowship-foley.png', NULL, true, 16, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
