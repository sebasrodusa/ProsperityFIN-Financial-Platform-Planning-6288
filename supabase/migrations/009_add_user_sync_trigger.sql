-- Sync auth.users changes to users_pf table
CREATE OR REPLACE FUNCTION public.handle_user_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.users_pf (id, email, name, role, status, created_at, avatar)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
      'active',
      NOW(),
      NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.users_pf
      SET email = NEW.email,
          name = COALESCE(NEW.raw_user_meta_data->>'name', name),
          role = COALESCE(NEW.raw_user_meta_data->>'role', role),
          updated_at = NOW(),
          avatar = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar)
      WHERE id = NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.users_pf WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_change ON auth.users;
CREATE TRIGGER on_auth_user_change
  AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_change();

