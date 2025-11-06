-- One-time fix: ensure demo2 (user_id from logs) has 'car-owner' role
insert into public.user_roles (user_id, role)
values ('4630966d-16c2-4a32-b6ef-6d94b0169695', 'car-owner'::public.app_role)
on conflict (user_id, role) do nothing;