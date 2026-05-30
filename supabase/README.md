# Base de datos (Supabase)

Pasos para dejar la base de datos lista.

## 1. Crear el esquema
1. Entra a tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor** → **New query**.
2. Pega el contenido de [`schema.sql`](./schema.sql) y pulsa **Run**.
   - Crea las 10 tablas, índices, cálculo automático de notas, RLS por rol y el trigger
     que genera el perfil de cada usuario al registrarse.

## 2. Cargar datos de ejemplo
1. En el SQL Editor, ejecuta la **Parte 1** de [`seed.sql`](./seed.sql) (datos académicos).
2. **Paso manual** — crea los 3 usuarios demo en **Authentication → Users → Add user**
   (marca *Auto Confirm User*):

   | Email | Contraseña | Rol |
   | --- | --- | --- |
   | `admin@demo.com` | `Demo1234!` | admin |
   | `docente@demo.com` | `Demo1234!` | docente |
   | `estudiante@demo.com` | `Demo1234!` | estudiante |

3. Ejecuta la **Parte 2** de `seed.sql` para asignar los roles y crear los perfiles de
   estudiante/docente.

## 3. Conectar la app
1. Supabase → **Project Settings → API**. Copia el **Project URL** y la **anon public key**.
2. En la raíz del proyecto, crea `.env` (a partir de `.env.example`):

   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

Con esto, cuando conectemos los hooks de autenticación podrás iniciar sesión con los usuarios demo.
