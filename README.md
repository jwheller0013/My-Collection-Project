# My-Collection-Project

My Collection is a collection app that allows a user to scan the barcode of an item to fill out parameters of an item to add to their collection. Once added to a collection the user can view their collections, view entries in their collection, edit entry details, sort the collection, select one at random from the collection, go to a random item from all their collections, and future plans to improve the control of your collection. Upc scan will fill out some fields of the entry but once entered entry details can be updated if not done in scan. Collection types help the app set parameters for entries in the collection and will be used to flesh out further features for specific types. Currently Movies, Books, Video Games, and General are the available options. Video Games categories and options for showing if lent out for an entry are things still for future updates. An AI feature has been added that will allow the user to ask for suggestions for what to add to a particular collection. The user will have to get a token from https://openrouter.ai/ but the app prompts that then saves the token as part of user's database.

Conect with me:
James Heller: https://www.linkedin.com/in/james-heller-xiii/

One Pager:
https://docs.google.com/document/d/14__qgkAhTvgre9afAtztiYwHHG60zgPDg6Nhidu0-34/edit?usp=sharing

Framework:
https://www.canva.com/design/DAGlGu7rXXo/MRdHojk-nfYWGeVD6qO0_w/view?utm_content=DAGlGu7rXXo&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h7abfc2bbaa#1

To use on your phone!
1. Install Termux from F-Droid (better than Play Store version)
https://github.com/termux/termux-app#f-droid

2. Open Termux and Create a folder
"mkdir my_projects" for example

3. Set up Python environment (open said directory):
cd ~/"whatever you named above"
pkg update && pkg upgrade
pkg install python
pip install flask flask-sqlalchemy flask-cors requests
pip install virtualenv
python -m venv venv
source venv/bin/activate

4. Download file, git clone this repo then the following:
cd into the folder My-Collection-Project
pip install -r requirements.txt
cd My_Collection
python test_users.py
python genre_table.py

5. Run the program!
cd .. to get back to My-Collection-Project
chmod +x run-mobile.sh (just that first time)
./run-mobile.sh
open browser to localhost:9000

6. When done open Termux enter crtl C to close down.
