-- Recreate RLS policies for renamed tables

-- Policies for users table (formerly user_profiles)
DROP POLICY IF EXISTS "Allow user profile creation" ON public.users;
CREATE POLICY "Allow user profile creation"
ON public.users FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.users;
CREATE POLICY "Super admins can view all profiles"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users up
    WHERE up.id = auth.uid()
    AND up.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.users;
CREATE POLICY "Super admins can manage all profiles"
ON public.users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users up
    WHERE up.id = auth.uid()
    AND up.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Organization staff can view profiles in their organization" ON public.users;
CREATE POLICY "Organization staff can view profiles in their organization"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users up
    WHERE up.id = auth.uid()
    AND up.organization_id = users.organization_id
    AND up.role IN ('clinic_admin', 'chief_specialist', 'specialist')
  )
);

-- Policies for organizations table (formerly clinics)
DROP POLICY IF EXISTS "Organizations are viewable by authenticated users" ON public.organizations;
CREATE POLICY "Organizations are viewable by authenticated users"
ON public.organizations FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Super admins can manage all organizations" ON public.organizations;
CREATE POLICY "Super admins can manage all organizations"
ON public.organizations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Organization admins and chief specialists can update their organization" ON public.organizations;
CREATE POLICY "Organization admins and chief specialists can update their organization"
ON public.organizations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = organizations.id
    AND users.role IN ('clinic_admin', 'chief_specialist')
  )
);

-- Policies for practitioners table (formerly specialists)
DROP POLICY IF EXISTS "Practitioners can view their own data" ON public.practitioners;
CREATE POLICY "Practitioners can view their own data"
ON public.practitioners FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.id = practitioners.user_id
  )
);

DROP POLICY IF EXISTS "Organization staff can view practitioners in their organization" ON public.practitioners;
CREATE POLICY "Organization staff can view practitioners in their organization"
ON public.practitioners FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = practitioners.organization_id
    AND users.role IN ('clinic_admin', 'chief_specialist', 'specialist')
  )
);

DROP POLICY IF EXISTS "Practitioners can update their own data" ON public.practitioners;
CREATE POLICY "Practitioners can update their own data"
ON public.practitioners FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.id = practitioners.user_id
  )
);

DROP POLICY IF EXISTS "Allow practitioner creation during registration" ON public.practitioners;
CREATE POLICY "Allow practitioner creation during registration"
ON public.practitioners FOR INSERT
WITH CHECK (true);

-- Policies for clients table (formerly patients)
DROP POLICY IF EXISTS "Clients can view their own data" ON public.clients;
CREATE POLICY "Clients can view their own data"
ON public.clients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.id = clients.user_id
  )
);

DROP POLICY IF EXISTS "Organization staff can view clients in their organization" ON public.clients;
CREATE POLICY "Organization staff can view clients in their organization"
ON public.clients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = clients.organization_id
    AND users.role IN ('clinic_admin', 'chief_specialist', 'specialist')
  )
);

DROP POLICY IF EXISTS "Clients can update their own data" ON public.clients;
CREATE POLICY "Clients can update their own data"
ON public.clients FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.id = clients.user_id
  )
);

DROP POLICY IF EXISTS "Allow client creation during registration" ON public.clients;
CREATE POLICY "Allow client creation during registration"
ON public.clients FOR INSERT
WITH CHECK (true);

-- Policies for flowbuilder table (formerly flows)
DROP POLICY IF EXISTS "Chief specialists can create flowbuilder" ON public.flowbuilder;
CREATE POLICY "Chief specialists can create flowbuilder"
ON public.flowbuilder
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
  SELECT id FROM users WHERE role = 'chief_specialist' OR role = 'specialist'
));

DROP POLICY IF EXISTS "Specialists can view flowbuilder" ON public.flowbuilder;
CREATE POLICY "Specialists can view flowbuilder"
ON public.flowbuilder
FOR SELECT
TO authenticated
USING (
  (auth.uid() IN (SELECT id FROM users WHERE role = 'chief_specialist' OR role = 'specialist'))
  OR
  (auth.uid() IN (SELECT user_id FROM clients WHERE id IN (SELECT client_id FROM flow_instances WHERE flowbuilder_id = flowbuilder.id)))
);

DROP POLICY IF EXISTS "Users can view their own flowbuilder" ON public.flowbuilder;
CREATE POLICY "Users can view their own flowbuilder"
ON public.flowbuilder
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Chief specialists can update flowbuilder" ON public.flowbuilder;
CREATE POLICY "Chief specialists can update flowbuilder"
ON public.flowbuilder
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role = 'chief_specialist'));

DROP POLICY IF EXISTS "Chief specialists can delete flowbuilder" ON public.flowbuilder;
CREATE POLICY "Chief specialists can delete flowbuilder"
ON public.flowbuilder
FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role = 'chief_specialist'));

-- Policies for flow_instances table (formerly flow_assignments)
DROP POLICY IF EXISTS "Specialists can create flow instances" ON public.flow_instances;
CREATE POLICY "Specialists can create flow instances"
ON public.flow_instances
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IN (
  SELECT id FROM users WHERE role = 'chief_specialist' OR role = 'specialist'
));

DROP POLICY IF EXISTS "Users can view their flow instances" ON public.flow_instances;
CREATE POLICY "Users can view their flow instances"
ON public.flow_instances
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'chief_specialist' OR role = 'specialist')
  OR
  auth.uid() IN (SELECT user_id FROM clients WHERE id = flow_instances.client_id)
);

DROP POLICY IF EXISTS "Specialists can update flow instances" ON public.flow_instances;
CREATE POLICY "Specialists can update flow instances"
ON public.flow_instances
FOR UPDATE
TO authenticated
USING (assigned_by = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role = 'chief_specialist' OR role = 'specialist'));

DROP POLICY IF EXISTS "Specialists can delete flow instances" ON public.flow_instances;
CREATE POLICY "Specialists can delete flow instances"
ON public.flow_instances
FOR DELETE
TO authenticated
USING (assigned_by = auth.uid() OR auth.uid() IN (SELECT id FROM users WHERE role = 'chief_specialist' OR role = 'specialist'));

-- Policies for sessions table (formerly appointments)
DROP POLICY IF EXISTS "Users can view sessions in their organization" ON public.sessions;
CREATE POLICY "Users can view sessions in their organization"
ON public.sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = sessions.organization_id
  )
);

DROP POLICY IF EXISTS "Specialists can manage sessions" ON public.sessions;
CREATE POLICY "Specialists can manage sessions"
ON public.sessions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = sessions.organization_id
    AND users.role IN ('chief_specialist', 'specialist')
  )
);

-- Policies for resources table (formerly tips)
DROP POLICY IF EXISTS "Users can view resources in their organization" ON public.resources;
CREATE POLICY "Users can view resources in their organization"
ON public.resources FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = resources.organization_id
  )
);

DROP POLICY IF EXISTS "Specialists can manage resources" ON public.resources;
CREATE POLICY "Specialists can manage resources"
ON public.resources FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.organization_id = resources.organization_id
    AND users.role IN ('chief_specialist', 'specialist')
  )
);

-- Policies for resource_assignments table (formerly tip_assignments)
DROP POLICY IF EXISTS "Users can view their resource assignments" ON public.resource_assignments;
CREATE POLICY "Users can view their resource assignments"
ON public.resource_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    JOIN public.users up ON c.user_id = up.id
    WHERE up.id = auth.uid()
    AND c.id = resource_assignments.client_id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('chief_specialist', 'specialist')
  )
);

DROP POLICY IF EXISTS "Specialists can manage resource assignments" ON public.resource_assignments;
CREATE POLICY "Specialists can manage resource assignments"
ON public.resource_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('chief_specialist', 'specialist')
  )
);

-- Policies for media_library table (formerly image_gallery)
DROP POLICY IF EXISTS "Allow users to view their own images" ON public.media_library;
CREATE POLICY "Allow users to view their own images"
ON public.media_library FOR SELECT
USING (auth.uid() = uploaded_by OR EXISTS (
  SELECT 1 FROM users 
  WHERE id = auth.uid() 
  AND role IN ('super_admin')
));

DROP POLICY IF EXISTS "Allow users to upload their own images" ON public.media_library;
CREATE POLICY "Allow users to upload their own images"
ON public.media_library FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

DROP POLICY IF EXISTS "Allow users to delete their own images" ON public.media_library;
CREATE POLICY "Allow users to delete their own images"
ON public.media_library FOR DELETE
USING (auth.uid() = uploaded_by OR EXISTS (
  SELECT 1 FROM users 
  WHERE id = auth.uid() 
  AND role IN ('super_admin', 'chief_specialist')
));

-- Policies for app_config table (formerly app_settings)
DROP POLICY IF EXISTS "Allow super_admin to read app_config" ON public.app_config;
CREATE POLICY "Allow super_admin to read app_config"
  ON public.app_config FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow super_admin to update app_config" ON public.app_config;
CREATE POLICY "Allow super_admin to update app_config"
  ON public.app_config FOR UPDATE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'super_admin'
  ));

DROP POLICY IF EXISTS "Allow super_admin to insert app_config" ON public.app_config;
CREATE POLICY "Allow super_admin to insert app_config"
  ON public.app_config FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'super_admin'
  ));

-- Policies for system_config table (formerly config)
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.system_config;
CREATE POLICY "Allow anonymous read access"
ON public.system_config
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow authenticated update access" ON public.system_config;
CREATE POLICY "Allow authenticated update access"
ON public.system_config
FOR UPDATE
USING (auth.role() = 'authenticated');
