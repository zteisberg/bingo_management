-- Current Clan of Dads board, transcribed from the supplied layout reference.
-- TOP SECRET cells contain no hidden answer in the database. Replace their names on reveal day.
-- This file is intended for a fresh project. Re-running it without clearing existing data will conflict.

insert into public.sections(id,name,unlocked,row,col,tile_cols) values
 ('northwest','Northwest',false,1,1,3), ('north_split','Northern Fork',false,1,3,2), ('northeast','Northeast',false,1,5,3),
 ('north_gate','North Gateway',false,2,3,2),
 ('west_split','Western Fork',false,3,1,2), ('west_gate','West Gateway',false,3,2,1), ('center','The Starting Board',true,3,3,3), ('east_gate','East Gateway',false,3,4,1), ('east_split','Eastern Fork',false,3,5,2),
 ('south_gate','South Gateway',false,4,3,2),
 ('southwest','Southwest',false,5,1,3), ('south_split','Southern Fork',false,5,3,2), ('southeast','Southeast',false,5,5,3);

-- Center: edge rows/columns are the multi-tile gateways in their respective direction.
insert into public.tiles(section_id,name,row,col) values
 ('center','Glacial Temotli',1,1), ('center','Cow Slippers',1,2), ('center','Sulphur Blades',1,3),
 ('center','Any Mystic Piece',2,1), ('center','Black Mask',2,3),
 ('center','Brine Sabre',3,1), ('center','Any Tzhaar Drop',3,2), ('center','Earthbound Tecpatl',3,3);

insert into public.tiles(section_id,name,row,col) values
 ('north_gate','Scurrius Spines (5) or Gryphon Uniques (2)',1,1), ('north_gate','Infernal Cape or Fire Capes (3)',1,2),
 ('west_gate','Scurrius Spines (5) or Gryphon Uniques (2)',1,1), ('west_gate','Infernal Cape or Fire Capes (3)',2,1),
 ('east_gate','Scurrius Spines (5) or Gryphon Uniques (2)',1,1), ('east_gate','Infernal Cape or Fire Capes (3)',2,1),
 ('south_gate','Scurrius Spines (5) or Gryphon Uniques (2)',1,1), ('south_gate','Infernal Cape or Fire Capes (3)',1,2);

-- Fork sections. Each side of a fork unlocks the outer board in that direction.
insert into public.tiles(section_id,name,row,col) values
 ('north_split','Zulrah Unique',1,1), ('north_split','Royal Titans Unique',1,2),
 ('north_split','Top Secret',2,1), ('north_split','Xerics Talisman (inert)',2,2),
 ('west_split','All Metal Zoots',1,1), ('west_split','Top Secret',1,2),
 ('west_split','Steel Ring',2,1), ('west_split','All Skull Sceptre Pieces',2,2),
 ('east_split','Top Secret',1,1), ('east_split','Every Satchel',1,2),
 ('east_split','Zombie Axe or Helm',2,1), ('east_split','Shield Left Half',2,2),
 ('south_split','Top Secret',1,1), ('south_split','BOTH Mogre Uniques',1,2),
 ('south_split','Antler Guard',2,1), ('south_split','Granite Shield',2,2);

insert into public.tiles(section_id,name,row,col) values
 ('northwest','DKS Ring (3)',1,1), ('northwest','Vorkath Head (5) or 1 Unique',1,2), ('northwest','Nightmare/PNM Unique',1,3),
 ('northwest','Venator Shard (2)',2,1), ('northwest','TOB Unique (3)',2,2), ('northwest','Maggot King Unique (2)',2,3),
 ('northwest','Barrows Unique (10)',3,1), ('northwest','1 Unique & 1 Quartz Duke',3,2), ('northwest','Araxxor Unique',3,3),
 ('northwest','Blood Shard',4,1), ('northwest','GG Unique',4,2), ('northwest','ANY Superior Unique',4,3),
 ('northeast','Revenant Weapon',1,1), ('northeast','Complete Malediction or Odium Ward',1,2), ('northeast','Voidwaker Piece',1,3),
 ('northeast','FULL Huey Drip',2,1), ('northeast','Wildy Rings or Weapon Upgrades (2)',2,2), ('northeast','FULL Combined Moons Set',2,3),
 ('northeast','Colo Unique (2) or Quivers (5)',3,1), ('northeast','1 Unique & 1 Quartz Vardorvis',3,2), ('northeast','Doom Unique',3,3),
 ('northeast','Dragon Pickaxe or D2H',4,1), ('northeast','Tecu Salamander',4,2), ('northeast','2 Mad Angel Uniques',4,3),
 ('southwest','3 Armour Seeds or 1 Enhanced',1,1), ('southwest','Zalcano Unique',1,2), ('southwest','2 TDS Unique',1,3),
 ('southwest','KQ Unique',2,1), ('southwest','Pharaoh Sceptre',2,2), ('southwest','Nihil Shards (200)',2,3),
 ('southwest','1 Unique & 1 Quartz Whisperer',3,1), ('southwest','TOA Unique (5)',3,2), ('southwest','GWD Armour Piece (3)',3,3),
 ('southwest','Full Godsword',4,1), ('southwest','1 Unique & 1 Quartz Leviathan',4,2), ('southwest','Cerb Crystals (2)',4,3),
 ('southeast','Bludgeon Piece',1,1), ('southeast','Full Dark Totem',1,2), ('southeast','Bottomless Compost Bucket',1,3),
 ('southeast','Thermy Unique (2)',2,1), ('southeast','Hydra Tail/Leather/Claw',2,2), ('southeast','Warped Sceptre',2,3),
 ('southeast','100 Oathplate Shards/Yama Unique',3,1), ('southeast','Chambers Weapon',3,2), ('southeast','Zenyte Shard',3,3),
 ('southeast','Charged Trident of the Seas',4,1), ('southeast','Golden Tench',4,2), ('southeast','Sarachnis Cudgel',4,3);

-- A tile can appear more than once below, allowing one objective to count toward
-- multiple directions (the four corner tiles of the center board do this).
insert into public.tile_gateways(tile_id,section_id)
select t.id,m.destination from public.tiles t join (values
 ('center',1,1,'north_gate'), ('center',1,1,'west_gate'),
 ('center',1,2,'north_gate'),
 ('center',1,3,'north_gate'), ('center',1,3,'east_gate'),
 ('center',2,1,'west_gate'), ('center',2,3,'east_gate'),
 ('center',3,1,'south_gate'), ('center',3,1,'west_gate'),
 ('center',3,2,'south_gate'),
 ('center',3,3,'south_gate'), ('center',3,3,'east_gate'),
 ('north_gate',1,1,'north_split'), ('north_gate',1,2,'north_split'),
 ('west_gate',1,1,'west_split'), ('west_gate',2,1,'west_split'),
 ('east_gate',1,1,'east_split'), ('east_gate',2,1,'east_split'),
 ('south_gate',1,1,'south_split'), ('south_gate',1,2,'south_split'),
 ('north_split',1,1,'northwest'), ('north_split',2,1,'northwest'),
 ('north_split',1,2,'northeast'), ('north_split',2,2,'northeast'),
 ('west_split',1,1,'northwest'), ('west_split',1,2,'northwest'),
 ('west_split',2,1,'southwest'), ('west_split',2,2,'southwest'),
 ('east_split',1,1,'northeast'), ('east_split',1,2,'northeast'),
 ('east_split',2,1,'southeast'), ('east_split',2,2,'southeast'),
 ('south_split',1,1,'southwest'), ('south_split',2,1,'southwest'),
 ('south_split',1,2,'southeast'), ('south_split',2,2,'southeast')
) as m(source_section,tile_row,tile_col,destination)
on t.section_id=m.source_section and t.row=m.tile_row and t.col=m.tile_col;

-- Optional reveal-day example (admins may also rename these in SQL):
-- update public.tiles set name='Revealed objective', description='...' where section_id='north_split' and row=2 and col=1;
