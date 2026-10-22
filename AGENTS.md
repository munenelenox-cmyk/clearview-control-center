<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Signed-in pages live under `src/routes/_authenticated/` and render inside `AppShell` (sidebar + header); the layout is client-only because the session lives in browser storage.
- App data is read/written from the browser through the generated client with RLS; permissions are enforced in the database (`is_approved`, `can_edit`, `has_role`), never only in the UI.
- Roles live in `public.user_roles` (one row per user: admin/editor/viewer). No row = awaiting approval; the first account to sign up becomes admin via the signup trigger.
- Generic CRUD goes through `useRows`/`useSaveRow`/`useDeleteRow` in `src/lib/data.ts`, and record forms use `FormDialog` field configs, so new tables follow the same pattern.
- Brand colours, fonts and badge variants are tokens in `src/styles.css` / `badge.tsx`; components use tokens, not raw colour classes.
