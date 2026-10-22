
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (one per user)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.can_edit(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'))
$$;

-- profiles policies
CREATE POLICY "Own profile readable" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Approved users read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- user_roles policies
CREATE POLICY "Read own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Approved users read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Admins insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin') AND user_id <> auth.uid());

-- Signup trigger: profile + first account becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Organisation settings (single row)
CREATE TABLE public.org_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name text NOT NULL DEFAULT 'L.E.A.P. Generation CBO',
  tagline text DEFAULT 'Learn • Empower • Achieve • Progress',
  mission text,
  reg_no text, serial_no text, reg_date date,
  county text, sub_county text, ward text, location text, sub_location text,
  postal_address text, physical_address text,
  email text, phone text, bank text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.org_settings TO authenticated;
GRANT ALL ON public.org_settings TO service_role;
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved read org" ON public.org_settings FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Admins update org" ON public.org_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER org_touch BEFORE UPDATE ON public.org_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Members register
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position text NOT NULL DEFAULT 'Member',
  phone text, email text, id_number text, gender text,
  status text NOT NULL DEFAULT 'Active',
  joined_on date DEFAULT CURRENT_DATE,
  is_signatory boolean NOT NULL DEFAULT false,
  is_executive boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 100,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved read members" ON public.members FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Editors insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors update members" ON public.members FOR UPDATE TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors delete members" ON public.members FOR DELETE TO authenticated USING (public.can_edit(auth.uid()));

-- Meetings
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  held_on date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'Meeting',
  venue text,
  attendance text,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetings TO authenticated;
GRANT ALL ON public.meetings TO service_role;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved read meetings" ON public.meetings FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Editors insert meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors update meetings" ON public.meetings FOR UPDATE TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors delete meetings" ON public.meetings FOR DELETE TO authenticated USING (public.can_edit(auth.uid()));

-- Finance
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  txn_date date NOT NULL DEFAULT CURRENT_DATE,
  kind text NOT NULL DEFAULT 'Contribution',
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  note text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved read txns" ON public.transactions FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Editors insert txns" ON public.transactions FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors update txns" ON public.transactions FOR UPDATE TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors delete txns" ON public.transactions FOR DELETE TO authenticated USING (public.can_edit(auth.uid()));

-- Activities
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  activity_date date,
  focus_area text DEFAULT 'Community projects',
  status text NOT NULL DEFAULT 'Planned',
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved read activities" ON public.activities FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Editors insert activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors update activities" ON public.activities FOR UPDATE TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors delete activities" ON public.activities FOR DELETE TO authenticated USING (public.can_edit(auth.uid()));

-- Compliance
CREATE TABLE public.compliance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  reference text,
  done boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_tasks TO authenticated;
GRANT ALL ON public.compliance_tasks TO service_role;
ALTER TABLE public.compliance_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved read compliance" ON public.compliance_tasks FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Editors insert compliance" ON public.compliance_tasks FOR INSERT TO authenticated WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors update compliance" ON public.compliance_tasks FOR UPDATE TO authenticated USING (public.can_edit(auth.uid())) WITH CHECK (public.can_edit(auth.uid()));
CREATE POLICY "Editors delete compliance" ON public.compliance_tasks FOR DELETE TO authenticated USING (public.can_edit(auth.uid()));

-- Seed data from the group's records
INSERT INTO public.org_settings (id, name, tagline, mission, reg_no, serial_no, reg_date, county, sub_county, ward, location, sub_location, postal_address, physical_address, email, phone, bank)
VALUES (1, 'L.E.A.P. Generation CBO', 'Learn • Empower • Achieve • Progress',
 'A community-driven youth initiative empowering young people with knowledge, skills, confidence and opportunities to build stronger, more sustainable communities in Embu County, Kenya.',
 'DSD/14/64/02/136624', 'CBO 0011885', '2025-09-10', 'Embu', 'Runyenjes', 'Gatiri North', 'Makengi', 'Kevote',
 'P.O. Box 24-60100, Embu', 'Kevote Market Grounds, near St Paul''s Kevote Catholic Church',
 'theleapgeneration01@gmail.com', NULL, 'KCB Embu');

INSERT INTO public.members (full_name, position, status, joined_on, is_signatory, is_executive, sort_order, notes) VALUES
 ('Lenox Munene','Chairperson','Active','2025-08-17',true,true,1,NULL),
 ('Tonny Brian Mutugi','Vice Chairperson','Pending confirmation','2025-08-17',false,true,2,'Named in the minutes but not in the attendance lists. Please confirm.'),
 ('Bonface Muriithi','Secretary','Active','2025-08-17',true,true,3,NULL),
 ('Cynthia Mukami','Vice Secretary','Active','2025-08-17',false,true,4,NULL),
 ('Allan Macharia','Treasurer','Active','2025-08-17',true,true,5,NULL),
 ('Joylily Mwende','Committee Member','Active','2025-08-17',false,true,6,NULL),
 ('Hannington Munene','Member','Active','2025-08-17',false,false,10,NULL),
 ('Royd Kiarie','Member','Active','2025-08-17',false,false,11,NULL),
 ('James Muriithi','Member','Active','2025-08-17',false,false,12,NULL),
 ('Charles Karanja','Member','Active','2025-08-17',false,false,13,NULL),
 ('Amos Mutembei','Member','Active','2025-08-17',false,false,14,NULL),
 ('Hillary Chomba','Member','Active','2025-08-17',false,false,15,NULL),
 ('Brian Macharia','Member','Active','2025-08-17',false,false,16,NULL),
 ('Johny Petaxon Maina','Member','Active','2025-08-17',false,false,17,NULL),
 ('Brian Gitonga','Member','Active','2025-08-17',false,false,18,NULL),
 ('Kennedy Mutembei','Member','Active','2025-08-17',false,false,19,NULL),
 ('Brian Gitonga Muthoni','Member','Active','2025-08-17',false,false,20,NULL),
 ('Stella Wakio','Member','Pending confirmation','2025-09-05',false,false,21,'Named in the minutes but not in the attendance lists. Please confirm.');

INSERT INTO public.meetings (held_on, title, kind, venue, attendance, summary) VALUES
 ('2025-08-17','Inaugural meeting','Meeting','Kevote Market Grounds, 4:00pm','16 present','Resolved to register as a CBO with the Ministry of Labour and Social Protection, Runyenjes. Six activities adopted. Officials elected by secret ballot. KCB chosen as bank; Chair, Secretary and Treasurer are signatories.'),
 ('2025-08-20','Kevote market clean-up','Activity','Kevote Market',NULL,'Community clean-up thanked and praised by Hannington Munene at the next meeting.'),
 ('2025-09-05','Members'' meeting','Meeting','Kevote Market Grounds, 4:00pm','16 present','Registration follow-up; clean-up review; treasurer proposed KCB Embu for the bank account; membership drive continues.'),
 ('2025-09-10','Certificate of registration issued','Milestone','Embu East Sub-County Social Development Office',NULL,'Registered as a CBO under the Community Groups Registration Act, No. 30 of 2022.');

INSERT INTO public.activities (name, activity_date, focus_area, status, description) VALUES
 ('Kevote market clean-up','2025-08-20','Environmental conservation','Done','Members cleaned up the Kevote market area.'),
 ('Tree planting – Karue Hill','2025-11-15','Environmental conservation','Planned','Tree planting and environmental awareness at Karue Hill.'),
 ('Youth mentorship sessions',NULL,'Youth empowerment','Planned','Mentorship on confidence, values, life skills and future goals.'),
 ('Mind Matters Initiative',NULL,'Community empowerment','Planned','Mental health awareness for high school and university students.');

INSERT INTO public.compliance_tasks (title, reference, sort_order) VALUES
 ('Open the KCB Embu bank account (signatories: Chair, Secretary, Treasurer)','Minutes 17 Aug 2025',1),
 ('Collect a copy of every member''s national ID for group records','Art. 8.3',2),
 ('Give each member a copy of the constitution and record their signature and ID number','Art. 21',3),
 ('Record all group assets in the register kept by Secretary and Treasurer','Art. 13',4),
 ('Treasurer''s quarterly financial report to the executive','Art. 11',5),
 ('Send meeting agenda to members by SMS one month before each meeting','Art. 15.2',6),
 ('Give members two months'' notice of elections','Art. 16.3',7),
 ('Hold the AGM in December: financial statements, dividends, planning','Art. 15.1',8),
 ('Independent annual audit read at the AGM','Art. 11',9),
 ('Submit any amended constitution to the social services office','Art. 18.3',10);
