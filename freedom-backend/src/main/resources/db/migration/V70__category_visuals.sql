ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS image_key VARCHAR(80);

-- Backfill visuals for the built-in categories. Custom/imported categories can
-- still keep NULL until the user chooses artwork in the category manager.
UPDATE categories
SET image_key = CASE slug
    WHEN 'groceries' THEN 'groceries'
    WHEN 'hairdresser' THEN 'hairdresser'
    WHEN 'eating-out' THEN 'eating-out'
    WHEN 'care' THEN 'care'
    WHEN 'transport' THEN 'transport'
    WHEN 'home' THEN 'home'
    WHEN 'pharmacy' THEN 'pharmacy'
    WHEN 'dentist' THEN 'dentist'
    WHEN 'supplements' THEN 'supplements'
    WHEN 'internet' THEN 'internet'
    WHEN 'loan' THEN 'loan'
    WHEN 'electricity' THEN 'electricity'
    WHEN 'subscriptions' THEN 'subscriptions'
    WHEN 'phone' THEN 'phone'
    WHEN 'taxes' THEN 'taxes'
    WHEN 'education' THEN 'education'
    WHEN 'gym' THEN 'gym'
    WHEN 'dance' THEN 'dance'
    WHEN 'investments' THEN 'investments'
    WHEN 'investment-fees' THEN 'investments'
    WHEN 'currency-spread' THEN 'fx-spread'
    WHEN 'gaming' THEN 'gaming'
    WHEN 'chess' THEN 'chess'
    WHEN 'equipment' THEN 'equipment'
    WHEN 'clothes' THEN 'clothes'
    WHEN 'health' THEN 'health'
    WHEN 'donations' THEN 'donations'
    WHEN 'gifts' THEN 'gifts'
    WHEN 'wedding' THEN 'wedding'
    WHEN 'trips' THEN 'trips'
    WHEN 'car' THEN 'car'
    WHEN 'sport' THEN 'sport'
    WHEN 'salary' THEN 'salary'
    WHEN 'gift-income' THEN 'gift-income'
    WHEN 'interest' THEN 'interest'
    WHEN 'tax-refund' THEN 'tax-refund'
    WHEN 'family' THEN 'family'
    WHEN 'sale' THEN 'sale'
    ELSE COALESCE(image_key, 'other')
END
WHERE image_key IS NULL;
