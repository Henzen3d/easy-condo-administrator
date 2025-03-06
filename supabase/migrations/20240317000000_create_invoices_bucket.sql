
-- Create a storage bucket for invoices if it doesn't exist
insert into storage.buckets (id, name, public)
select 'invoices', 'invoices', true
where not exists (
    select 1 from storage.buckets where id = 'invoices'
);

-- Policy to allow public read access to all files in the invoices bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'invoices' );

-- Policy to allow authenticated users to upload files to the invoices bucket
create policy "Authenticated users can upload files"
on storage.objects for insert
with check (
    bucket_id = 'invoices'  
    and auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to update their own files in the invoices bucket
create policy "Authenticated users can update their own files"
on storage.objects for update
using (
    bucket_id = 'invoices'
    and auth.role() = 'authenticated'
)
with check (
    bucket_id = 'invoices'
    and auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete their own files in the invoices bucket
create policy "Authenticated users can delete their own files"
on storage.objects for delete
using (
    bucket_id = 'invoices'
    and auth.role() = 'authenticated'
);
