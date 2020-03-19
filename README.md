
<img src="https://raw.githubusercontent.com/cherkesky/genieio/master/assets/logo.png" height="200" width="400">

### by Guy Cherkesky | [LinkedIn](http://linkedin.com/in/cherkesky) | [Website](http://cherkesky.com)



GenieIO is a Full Stack React.js/Django app that connects users who want to make a wish (ex: I want to pass calculus) to users that think they can grant their wishes (ex: I’m a calculus instructor. I think I can help you!). There is a dedicated section for the Wishers to send their wishes and a section for Granters to search for a wish to grant. If a Wisher gets a Grant request they can reject or approve the request. If they choose to approve the request, their contact info will be shared with the Granter.The home page shows a word cloud made from the wish’s keywords. The wishes are processed with NLTK to remove all the stop words and leave only the important keywords for the word cloud. GenieIO also allows users to text wishes from their phones.


<img src="https://github.com/cherkesky/GenieIO/blob/master/assets/genie_home.gif" height="400" width="600">


## Details


#### Technology Stack: 
Full CRUD functionality
- JS: Vanilla Javascript, React, Node.JS, Express
- Python: Vanilla Python, Django
- Styles: CSS, Material UI, Figma
- Libraries: NLTK, React WordCloud, Twilio
- Version Control: Git, Github
- DB: SQLite3, Mongo.DB

## Running Locally
- Backend: https://github.com/cherkesky/GenieIO/
- Frontend: https://github.com/cherkesky/genieiofront
- SMS Server: https://github.com/cherkesky/genieiosms

Backend (Python, Django):
In the project directory, you can run:
### `python manage.py runserver`

Frontend (Javscript, React)
In the project directory, you can run:
### `npm start`

SMS text server (Node.JS, Express)
In the project directory, you can run:
### `node src/server.js`
and on a different terminal window, you can run:
### `twilio phone-numbers:update "+16152355775" --sms-url="http://localhost:1337/sms"`

Make a wish!
