# Using the CMS Admin Panel

## Accessing the Admin

You can manage news and events at:

```
https://jimdynasty.github.io/SEAweb/admin/
```

We use **Sveltia CMS**, a modern interface that works directly with your GitHub repository.

## Managing News Posts

1. Go to `/admin`
2. Login with GitHub
3. Click "News"
4. Click "New News"
5. Fill in the form:
   - **Title**: Post headline
   - **Publish Date**: When to show the post
   - **Featured**: Check to feature on news page
   - **Category**: Press Release, Tour, Award, etc.
   - **Excerpt**: Short summary
   - **Body**: Full content (supports markdown)
   - **Featured Image**: Optional cover image
   - **Book Series**: Which series this relates to

6. Click "Publish"

## Managing Events

1. Go to `/admin`
2. Click "Events"
3. Click "New Events"
4. Fill in the form:
   - **Event Title**: Name of the event
   - **Event Date**: Date and time
   - **Event Type**: Book Signing, Festival, etc.
   - **Location Name**: Venue name
   - **Address**: Full address (optional)
   - **Time**: Display time (e.g., "6:30 PM")
   - **Description**: What to expect
   - **Ticket Link**: URL for tickets
   - **Past Event**: Check after event is over

5. Click "Publish"

## How it Works

- **No Database:** Content is saved as Markdown files in `/content/` directly in your GitHub repo.
- **Automated Builds:** When you click "Publish", a GitHub Action runs in the background. It takes about **2-3 minutes** for the live site to update.
- **Hosting:** Free on GitHub Pages.
