-- Флаг тимлида (проставляется вручную владельцем проекта через Table Editor)
alter table public.profiles
  add column if not exists is_team_lead boolean default false;

-- Настоящее разграничение видимости задач на уровне базы данных:
-- дизайнеры и тимлиды видят всё, обычные баеры -- только свои задачи
drop policy if exists "authenticated users can read all tasks" on public.tasks;

create policy "role-based task visibility"
  on public.tasks for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.role = 'designer' or p.is_team_lead = true)
    )
    or posted_by_id = auth.uid()
  );
