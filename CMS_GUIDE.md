# Using the CMS Admin Panel

## Accessing the Admin

Once your site is deployed to Netlify, you can manage news and events at:

```
https://your-site.netlify.app/admin
```

For local testing with the backend, run:

```bash
# Install Netlify CMS proxy server
npx netlify-cms-proxy-server

# In another terminal, serve the site
python3 -m http.server 8000
```

Then visit: http://localhost:8000/admin

## Managing News Posts

1. Go to `/admin`
2. Click "News"
3. Click "New News"
4. Fill in the form:
   - **Title**: Post headline
   - **Publish Date**: When to show the post
   - **Featured**: Check to feature on news page
   - **Category**: Press Release, Tour, Award, etc.
   - **Excerpt**: Short summary
   - **Body**: Full content (supports markdown)
   - **Featured Image**: Optional cover image
   - **Book Series**: Which series this relates to

5. Click "Publish" or "Save as Draft"

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

## Tips

- Events automatically hide once they're in the past (if "Past Event" is checked)
- Homepage shows the next 3 upcoming events
- Featured news posts appear at the top of the news page
- All content is stored in markdown files in `/content/news/` and `/content/events/`
- Content is version-controlled with your site code

## No Backend Needed

Netlify CMS works directly with your Git repository. When you publish content through the admin panel, it commits the markdown file to your repository, which triggers a new deployment. No database required!
