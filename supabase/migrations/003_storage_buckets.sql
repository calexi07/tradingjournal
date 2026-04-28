-- ─── BUCKET pentru screenshot-uri trade ───────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trade-screenshots',
  'trade-screenshots',
  FALSE,
  5242880,
  ARRAY['image/png','image/jpeg','image/webp']
);

-- Doar userul autentificat poate uploada în folderul lui
CREATE POLICY "Authenticated users upload own screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can view own screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can delete own screenshots"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );
