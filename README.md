# pie-sign-in

A real-time event sign in application 

My church has a monthly outreach ministry event that's typically attended by 25-30 people.  We needed a simpler way to identify attendees and organize them into smaller groups.  This event sign-in application saves the attendees' information to firebase in real-time.  

As event attendees sign in on a laptop by filling in their name, email, etc. (without clicking a button), their data is sync-ed over to a separate admin view that an event host views on her iPad.  She can then place attendees into groups via drag-and-drop interface that immediately syncs every change to a real-time database (firebase)

Some notable things:
- contains 2 views - a public sign in view for attendees and an admin view for viewing attendees and drag-and-dropping them into smaller groups.  The admin view is updated in real-time as attendees sign in
- utilizes knockout to render multiple lists of people
- functionality for auto-organizing the list of people into smaller groups.  These groups can later be overriden by the admin by dragging-and-dropping names between groups
- Admin authentication and saving of attendees information are both handled with parseDB

Tech stack: knockoutjs, bootstrap, jquery UI, firebase, parse, requireJS

