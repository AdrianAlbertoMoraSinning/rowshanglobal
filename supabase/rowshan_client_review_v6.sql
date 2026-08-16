-- Rowshan Moving Company — Client Review v6
-- Run once in Supabase SQL Editor after deploying the v6 website.

update public.services set active=false, updated_at=now() where id in ('labour','pickup','truck2','junk','packing');

insert into public.services(id,name,category,description,price,unit,minimum,image,active,sort_order) values
('labour1','Labour Only — 1 Mover','Standard Package','One professional mover for labour-only moving help. No vehicle included.',60,'hour',2,'assets/rowshan-loading-crew.webp',true,10),
('pickup1','Small Move — 1 Mover + Pickup Truck','Standard Package','One mover with a pickup truck for smaller moves, deliveries and local transport.',70,'hour',2,'assets/rowshan-loading-crew.webp',true,20),
('pickup2','Small Move — 2 Movers + Pickup Truck','Standard Package','Two movers with a pickup truck for small moves that need additional labour.',110,'hour',2,'assets/rowshan-loading-crew.webp',true,30),
('box10_1','Standard Move — 1 Mover + 10-Foot Box Truck','Standard Package','One mover with a 10-foot box truck for standard local moving needs.',110,'hour',2,'assets/rowshan-box-truck-service.webp',true,40),
('box10_2','Standard Move — 2 Movers + 10-Foot Box Truck','Standard Package','Two movers with a 10-foot box truck for efficient residential and small-business moves.',150,'hour',2,'assets/rowshan-box-truck-service.webp',true,50),
('box15_1','Large Move — 1 Mover + 15-Foot Box Truck','Standard Package','One mover with a 15-foot box truck for larger loads and local moves.',120,'hour',2,'assets/rowshan-box-truck-service.webp',true,60),
('box15_2','Large Move — 2 Movers + 15-Foot Box Truck','Standard Package','Two movers with a 15-foot box truck for larger residential or commercial moves.',170,'hour',2,'assets/rowshan-box-truck-service.webp',true,70),
('box20_2','Larger Move — 2 Movers + 20–26-Foot Box Truck','Standard Package','Two movers with a larger 20–26-foot box truck for high-volume moving jobs.',200,'hour',2,'assets/rowshan-box-truck-service.webp',true,80),
('helper','Additional Helper — 1 Extra Mover','Add-on','Add one extra mover to any standard package. The same booking minimum applies.',60,'hour',2,'assets/rowshan-residential-move.webp',true,90)
on conflict (id) do update set name=excluded.name,category=excluded.category,description=excluded.description,price=excluded.price,unit=excluded.unit,minimum=excluded.minimum,image=excluded.image,active=excluded.active,sort_order=excluded.sort_order,updated_at=now();
