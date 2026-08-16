datreserve - link in bio reservation page

Stack: Nextjs Nestjs Typeorm Tailwind Postgres

Style: Dark neutral color with neon green accent, Inter as main and Instrument Serif as secondary font from google fonts. The logo is neon green background with "dr" bold black Inter.

Simple link in bio online reservation for service providers (barbers, consultants, nail artists etc)

After registration ->

Onboarding page getting this details:

STAGE 1:

- Name 

- Last name

- Name of the company

- reservation app url slug (datreserve.vercel.app/book/x)

- country

- phone number

STAGE 2:

Add profile picture

Add cover image

STAGE 3:

Select an icon which matches best to your niche and if your service depends on a location add the location info also

STAGE 4:

working time

def weekdays 9-17 30m gap options but i can write by myself also on input if its correct

All datas are required and based on these youll get your custom book page

If you go on admin page you have a sidebar with these menus

Your reservation page *different from all menu points*

1. Calendar

2. Settings:

    - Profile: 

        - all inputs from stage1 + currency + location if it was added

        - description / about you section

        - socials section

    - Display: 

        - 6 premade themes

        - add/change cover image    

    - Working time:

         same as in stage 4

    - Rules:

        - You can book an appointment up to x days in advance (30 days default)

        - You cannot book an appointment x hours before the start time. (3 hours default)

3. Services:

- Add service button

- Your services listed out

    - Add service page: 

        - Name of the service

        - Price ( + currency (if it wasnt updated in settings use the selected countrys currency from onboarding))

        - Location (if the user didnt gave location set online, if did add it that)

        - Notes

        - Description

        - Length (number selector + select between hour and minutes))

        - Icon selector (default will be from the onboarding)

        The services should be saved in the selected countrys timezone.

4. Clients

Add client button (Name, email, birth, phone number, notes)

- simple table about clients by appointments made

Name, Email, Phone number, Last appointment, Number of bookings

On bottom of sidebar: 

Profile picture and name, logout button

---

Reservation page: 

A card with banner picture, profile picture on left ( twitter like ) , name, description, social icons

Another card with book apointments text and services of that person: 

Service item: icon on left, on right name of the service and length of the service

When clicked to a service, it would show the free times:

Free times:

Name of the service ( icon, name, length, company)

Calendar ( month and days on left, times for that day on right)

Back and Continue button

Next stage:

Name

Email

Phone number (country selector for prefix, and phone number input)

Notes

Next stage:

Overview of the booking

And Confirm button 

If it was confirmed, generate an .ics file and make a button so user can add it to his calendar.

