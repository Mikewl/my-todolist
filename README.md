# Todo list exercise

### Install

- Install https://nodejs.org/en/
- Download archive from link provided
- Unzip file and cd into it
- run `npm install`

### Run
`node app.js`

Visit http://localhost:8080 in your browser

### High level application requirements
1. Multiple users should be able to view the shared public todo list
2. Should be able to add items
3. Should be able to delete items
4. Should be able to edit items (Missing feature)
5. Must be able to deploy in docker (Missing feature)

### Tasks
1. Add missing requirement #4 to the application
2. Add sufficient test coverage to the application and update readme on how to run the tests
3. Add missing requirement #5 to the application (Dockerfile and update readme with instructions)

### Bonus
4. Display test coverage after tests are executed
5. Find and fix the XSS vulnerability in the application. Also make sure that it wont happen again by including a test.

> ### Notes
> - Update the code as needed and document what you have done in the readme below
> - Will be nice if you can git tag the tasks by number

### Solution
Initially, make a test version of an edit function.
  - This test function was created as two text boxes and a button
    + Textbox 1 for id and 2 for the new value with the used for adding the edit.
    + This is found in the 2nd commit of the repository.

Improve on this to have a decent UI for the functionality.
  - Editing was to be inline
    + Replace the displayed item with a textbox which contained the item text
  - Only one editor could be open client side
    + No server side lock was added for editing the same item
    + A message is displayed when opening a second editor and the opening of the new editor is blocked

While the initial version worked, it was unpleasant visually and unwieldy with expecting the user to have to 
manually enter the index and new value manually. This could have been improved with a combobox for index and
automatically inserting the text into the editbox however I felt that this was still less pleasant than the
current iteration. Here the item to be edited is the one clicked on, the edit button and the delete button 
are not next to each other potentially causing misclicks deleting items and it is simple to edit or cancel
as desired.
