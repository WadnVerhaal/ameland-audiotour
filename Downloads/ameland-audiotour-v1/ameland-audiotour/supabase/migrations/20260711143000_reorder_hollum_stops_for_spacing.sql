begin;

-- Keep the original start and finish, but spread consecutive middle stops
-- so no two consecutive route points are close enough to share a GPS zone.
update public.tour_stops
set order_index = order_index + 100
where tour_id = '057516f3-1f33-447d-b631-9151c64ed4af'::uuid;

update public.tour_stops
set order_index = case id
  when '1ad2fb20-77b9-473a-8cc6-faee7f5ed7db'::uuid then 1 -- Welkom in het oude dorp
  when '5e7e10f7-6e15-4b76-81f6-5ee54e02e804'::uuid then 2 -- Museum Sorgdrager
  when 'ffd7b2df-1c1c-46bb-a864-d8fb7e3676af'::uuid then 3 -- De commandeurshuizen
  when '530077fc-2373-4177-9e7b-08898a0c22d3'::uuid then 4 -- Magnuskerk en kerkhof
  when '8ed0b1b5-a448-4dc7-92dd-50256206f0ef'::uuid then 5 -- Hidde Dirks Kat
  when '7925b7a2-1d68-4197-8059-91b346f7fef0'::uuid then 6 -- Van dorp naar duin
  when '942dda2a-5816-4782-aaa6-2d5bf1cf927a'::uuid then 7 -- Molen De Verwachting
  when '44ba2bb2-02ff-4e38-987d-5f24e162fc98'::uuid then 8 -- Maritiem Centrum Abraham Fock
  when 'd12c195e-a39c-4074-a198-a3df180e5da9'::uuid then 9 -- Vuurtoren Ameland
  else order_index
end
where tour_id = '057516f3-1f33-447d-b631-9151c64ed4af'::uuid;

commit;
