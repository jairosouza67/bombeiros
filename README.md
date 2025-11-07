# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/31f5259c-e2aa-48f9-9963-4564272ca0c9

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/31f5259c-e2aa-48f9-9963-4564272ca0c9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/31f5259c-e2aa-48f9-9963-4564272ca0c9) and click on Share -> Publish.

## Supabase Setup

This project uses Supabase for backend services including database and file storage.

### Database Migrations

To apply database migrations:

```sh
npx supabase db reset
```

### Storage Setup

For file uploads (PDFs and images), you need to create a storage bucket in Supabase:

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket named `content`
4. Set it to public
5. Create the following folders inside the bucket:
   - `flows/pdf/`
   - `flows/image/`
   - `music/pdf/`
   - `music/image/`

### Storage Policies

Add the following policies to the `content` bucket:

- Allow authenticated users to upload files
- Allow public read access

Example policy for uploads:
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

Example policy for public reads:
```sql
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (true);
```
