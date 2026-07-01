-- Function to handle new user signups and automatically create a profile AND link past orders
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Create the profile
  INSERT INTO public.profiles (id, full_name, is_admin)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', false);

  -- 2. Retroactively link past guest orders to this new account
  -- This ensures that if they check out as a guest and then create an account,
  -- their past orders (and the one they just placed) are securely linked to them.
  UPDATE public.orders
  SET user_id = new.id
  WHERE customer_email = new.email
    AND user_id IS NULL;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
