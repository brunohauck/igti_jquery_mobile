
CONTACTS.namespace('CONTACTS.app.getContacts');
CONTACTS.namespace('CONTACTS.app.buildContactList');
CONTACTS.namespace('CONTACTS.app.getContactById');
CONTACTS.namespace('CONTACTS.app.buildContactDetail');
CONTACTS.namespace('CONTACTS.app.restEndpoint');

CONTACTS.app.restEndpoint = 'http://localhost:4000/api';


$( document ).on( "pagecreate", function(mainEvent) {
    //Initialize the vars in the beginning so that you will always have access to them.
    var getCurrentTime = CONTACTS.util.getCurrentTime,
        restEndpoint = CONTACTS.app.restEndpoint;

    console.log(getCurrentTime() + " [js/app.js] (document -> pagecreate) - start");

 
    $('#contacts-list-page').on( "pagebeforeshow", function(e) {
        if(e.handled !== true) {
            console.log(getCurrentTime() + " [js/app.js] (#contacts-list-page -> pagebeforeshow) - start");

            // Fetches the initial Contact data.
            CONTACTS.app.getContacts();

            e.handled = true;
            console.log(getCurrentTime() + " [js/app.js] (#contacts-list-page -> pagebeforeshow) - end");
        }
    });

    // This is called on 'pagebeforeshow' above and by the CONTACTS.submissions
    // Uses JAX-RS GET to retrieve current contact list.
    CONTACTS.app.getContacts = function () {
        console.log(getCurrentTime() + " [js/app.js] (getContacts) - start");
        var jqxhr = $.ajax({
            url: restEndpoint + '/getAllUsers',
            cache: false,
            type: "GET"
        }).done(function(data, textStatus, jqXHR) {
            console.log(getCurrentTime() + " [js/app.js] (getContacts) - succes on ajax call");
            CONTACTS.app.buildContactList(data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log(getCurrentTime() + " [js/app.js] (getContacts) - error in ajax - " +
                        " - jqXHR = " + jqXHR.status +
                        " - textStatus = " + textStatus +
                        " - errorThrown = " + errorThrown);
        });
        console.log(getCurrentTime() + " [js/app.js] (getContacts) - end");
    };


    CONTACTS.app.buildContactList = function (contacts) {
        console.log(getCurrentTime() + " [js/app.js] (buildContactList) - start");
        var contactList = "",
            contactDetailList = "";

        // The data from the AJAX call is not sorted alphabetically, this will fix that.
        contacts.sort(function(a,b){
              var aName = a.name.toLowerCase();
              var bName = b.name.toLowerCase();
              return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
        });

        // Pull the info out of the Data returned from the AJAX request and create the HTML to be placed on the page.
        $.each(contacts, function(index, contact) {
            // Create the HTML for the List only view.
            contactList = contactList.concat(
                "<li id=list-contact-ID-" + contact._id.toString() + " class=contacts-list-item >" +
                    "<a href='#contacts-edit-page' >" + contact.name.toString() + "</a>" +
                "</li>");
            // Create the HTML for the Detailed List view.
            contactDetailList = contactDetailList.concat(
                "<li id=detail-contact-ID-" + contact._id.toString() + " class=contacts-detail-list-item >" +
                    "<a href='#contacts-edit-page' >" + contact.name.toString() + "</a>" +
                    "<img src='" +contact.img_url+ "' >" +
                    "<div class='detialedList'>" +
                        "<p><strong>" + contact.email.toString() + "</strong></p>" +
                        "<p>" + contact.phone.toString() + "</p>" +                     
                    "</div>" +
                 "</li>");
        });

        // Start with a clean list element otherwise we would have repeats.
        $('#contacts-display-listview').empty();

        // Check if it is already initialized or not, refresh the list in case it is initialized otherwise trigger create.
        if ( $('#contacts-display-listview').hasClass('ui-listview')) {
            console.log(getCurrentTime() + " [js/app.js] (#contacts-display-listview - hasClass ui-listview) - append.listview - start");
            $('#contacts-display-listview').append(contactList).listview("refresh", true);
            console.log(getCurrentTime() + " [js/app.js] (#contacts-display-listview - hasClass ui-listview) - append.listview - end");
        }
        else {
            console.log(getCurrentTime() + " [js/app.js] (#contacts-display-listview - !hasClass ui-listview) - append.trigger - start");
            $('#contacts-display-listview').append(contactList).enhanceWithin();
            console.log(getCurrentTime() + " [js/app.js] (#contacts-display-listview - !hasClass ui-listview) - append.trigger - end");
        }

        // Start with a clean list element otherwise we would have repeats.
        $('#contacts-display-detail-listview').empty();

        // check if it is already initialized or not, refresh the list in case it is initialized otherwise trigger create
        if ( $('#contacts-display-detail-listview').hasClass('ui-listview')) {
            console.log(getCurrentTime() + " [js/app.js] (#contacts-display-detail-listview - hasClass ui-listview) - append.listview - start");
            $('#contacts-display-detail-listview').append(contactDetailList).listview("refresh", true);
            console.log(getCurrentTime() + " [js/app.js] (#contacts-display-detail-listview - hasClass ui-listview) - append.listview - end");
        }
        else {
            console.log(getCurrentTime() + " [js/app.js] (#contacts-display-detail-listview - !hasClass ui-listview) - append.trigger - start");
            $('#contacts-display-detail-listview').append(contactDetailList).enhanceWithin();
            console.log(getCurrentTime() + " [js/app.js] (#contacts-display-detail-listview - !hasClass ui-listview) - append.trigger - end");
        }

        // Attach onclick event to each row of the contact list that will open up the contact info to be edited.
        $('.contacts-list-item').on("click", function(event){
            if(event.handled !== true) {
                console.log(getCurrentTime() + " [js/app.js] (.contacts-display-listview -> on click) - start");

                CONTACTS.app.getContactById($(this).attr("id").split("list-contact-ID-").pop());

                event.handled = true;
                console.log(getCurrentTime() + " [js/app.js] (.contacts-display-listview -> on click) - end");
            }
        });

        // Attach onclick event to each row of the contact list detailed page that will open up the contact info to be edited.
        $('li.contacts-detail-list-item').on("click", function(event){
            if(event.handled !== true) {
                console.log(getCurrentTime() + " [js/app.js] (li.contacts-display-listview -> on click) - start");

                CONTACTS.app.getContactById($(this).attr("id").split("detail-contact-ID-").pop());

                // Turn the whole <li> into a link.
                $("body").pagecontainer("change", "#contacts-edit-page");

                event.handled = true;
                console.log(getCurrentTime() + " [js/app.js] (li.contacts-display-listview -> on click) - end");
            }
        });

        console.log(getCurrentTime() + " [js/app.js] (buildContactList) - end");
        // Add in a line to visually see when we are done.
        console.log("-----------------------------List Page---------------------------------------");
    };

    // This is called by the on click event list above.
    // Retrieve employee detail based on employee id.
    CONTACTS.app.getContactById = function (contactID) {
        console.log(getCurrentTime() + " [js/app.js] (getContactById) - start");
        console.log(getCurrentTime() + " [js/app.js] (getContactById) - contactID = " + contactID);

        var jqxhr = $.ajax({
            url: restEndpoint + "/getUserById/" + contactID.toString(),
            cache: false,
            type: "GET"
        }).done(function(data, textStatus, jqXHR) {
            console.log(getCurrentTime() + " [js/app.js] (getContactById) - success on ajax call");
            console.log("--------Entrou--------------")
            CONTACTS.app.buildContactDetail(data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log(getCurrentTime() + " [js/app.js] (getContactById) - error in ajax" +
                        " - jqXHR = " + jqXHR.status +
                        " - textStatus = " + textStatus +
                        " - errorThrown = " + errorThrown);
        });
        console.log(getCurrentTime() + " [js/app.js] (getContactById) - end");
    };

    // This is called by CONTACTS.app.getContactById.
    // Display contact detail for editing on the Edit page.
    CONTACTS.app.buildContactDetail = function(contact) {
        console.log(contact)
        console.log(getCurrentTime() + " [js/app.js] (buildContactDetail) - start");

        // The intl-Tel-Input plugin stores the lasted used country code and uses it to predetermin the flag to be
        // displayed. So we remove the plugin before the data gets loaded in the Edit form and then initialize it after.
        $("#contacts-edit-input-tel").intlTelInput("destroy");

        // Put each field value in the text input on the page.
        $('#contacts-edit-input-firstName').val(contact[0].name);
        $('#contacts-edit-input-lastName').val(contact[0].username);
        $('#contacts-edit-input-tel').val(contact[0].phone);
        $('#contacts-edit-input-email').val(contact[0].email);
        $('#contacts-edit-input-id').val(contact[0]._id);

        // The intl-Tel-Input plugin needs to be initialized everytime the data gets loaded into the Edit form so that
        // it will correctly validate it and display the correct flag.
        $('#contacts-edit-input-tel').intlTelInput({nationalMode:false});

        console.log(getCurrentTime() + " [js/app.js] (buildContactDetail) - end");
        // Add in a line to visually see when we are done.
        console.log("-----------------------------Update Page---------------------------------------");
    };

    console.log(getCurrentTime() + " [js/app.js] (document -> pagecreate) - end");
});


