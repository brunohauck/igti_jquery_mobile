CONTACTS.namespace('CONTACTS.submissions.submitCreate');
CONTACTS.namespace('CONTACTS.submissions.submitUpdate');
CONTACTS.namespace('CONTACTS.submissions.deleteContact');

$(document).ready(function() {
    //Inicialize as variáveis ​​no início para que você sempre tenha acesso a elas.
    var getCurrentTime = CONTACTS.util.getCurrentTime,
        restEndpoint = CONTACTS.app.restEndpoint,
        run;

    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    run = function () {
        console.log(getCurrentTime() + " [js/submissions.js] (run) - start");
        // Busca os dados iniciais do contato
        CONTACTS.submissions.submitCreate();
        CONTACTS.submissions.submitUpdate();
        CONTACTS.submissions.deleteContact();
        console.log(getCurrentTime() + " [js/submissions.js] (run) - end");
    };

    /**
     * Tenta registrar um novo contato usando um POST JAX-RS.
     */
    CONTACTS.submissions.submitCreate = function() {
        console.log(getCurrentTime() + " [js/submissions.js] (submitCreate) - start");

        $("#contacts-add-form").submit(function(event) {
            console.log(getCurrentTime() + " [js/submissions.js] (submitCreate - submit event) - checking if the form is valid");
            // Ensure that the form has been validated.
            CONTACTS.validation.addContactsFormValidator.form();
            // If there are any validation error then don't process the submit.
            if (CONTACTS.validation.addContactsFormValidator.valid()){
                console.log(getCurrentTime() + " [js/submissions.js] (submitCreate - submit event) - started");
                event.preventDefault();
//                $('#contacts-list-page').remove();

                // Transforme os campos do formulário em JSON.
                var serializedForm = $("#contacts-add-form").serializeObject();
                // Faz o parse do objeto para conctaData
                var contactData = JSON.stringify(serializedForm);
                console.log("-------------------------->");
                //console.log(serializedForm);
                console.log(contactData)
                console.log(getCurrentTime() + " [js/submissions.js] (submitCreate - submit event) - contactData = " + contactData);
                var jqxhr = $.ajax({
                    url: restEndpoint + '/createuser',
                    contentType: "application/json",
//                    dataType: "json",
                    data: contactData,
                    type: "POST"
                }).done(function(data, textStatus, jqXHR) {
                    console.log(getCurrentTime() + " [js/submissions.js] (submitCreate) - ajax done");
                    CONTACTS.validation.formEmail = null;
                    // reseta o formulario
                    $('#contacts-add-form')[0].reset();
                    // Remove os erros
                    $('.invalid').remove();
                    $("body").pagecontainer("change", "#contacts-list-page");

                }).fail(function(jqXHR, textStatus, errorThrown) {
                    // Remova todos os erros que não fazem parte do sistema de validação.
                    $('.invalid').remove();
                    // Verifique os erros de validação do lado do servidor. Isso deve capturar a validação de exclusividade de email.
                    if ((jqXHR.status === 409) || (jqXHR.status === 400)) {
                        console.log(getCurrentTime() + " [js/submissions.js] (submitCreate) - error in ajax - " +
                                "Validation error updating contact! " + jqXHR.status);
                        var contact = $("#contacts-add-form")[0];
                        // Extract the error messages from the server.
                        var errorMsg = $.parseJSON(jqXHR.responseText);
                        // Somente se ocorrer um erro de email
                        $.each(errorMsg, function(index, val) {
                            if (index === 'email'){
                                $.each(contact, function(index, val){
                                    if (val.name == "email"){
                                        CONTACTS.validation.formEmail = val.value;
                                        return false;
                                    }
                                });
                            }
                        });

                        // Mostra os erros no formulários
                        CONTACTS.validation.displayServerSideErrors("#contacts-add-form", errorMsg);
                        console.log(getCurrentTime() + " [js/submissions.js] (submitCreate) - error in ajax - " +
                                "Validation error displayed in the form for the user to fix! ");
                    } else if (jqXHR.status >= 200 && jqXHR.status < 300 || jqXHR.status === 304) {
                        console.log(getCurrentTime() + " [js/submissions.js] (submitCreate) - ajax error on 20x with error message: "
                                + errorThrown.message);
                        console.log(getCurrentTime() + " [js/submissions.js] (submitCreate) - ajax error because the REST service doesn't return" +
                                "any data and this app expects data.  Fix the REST app or remove the 'dataType:' option from the AJAX call.");
                        //em caso de erro 
                        var errorMsg = $.parseJSON(jqXHR.responseText);
                        // Mostra os erros no formulario
                        CONTACTS.validation.displayServerSideErrors("#contacts-add-form", errorMsg);

                        console.log(getCurrentTime() + " [js/submissions.js] (submitCreate) - ajax error on 20x - " +
                                "after displayServerSideErrors()");
                    } else {
                        console.log(getCurrentTime() + " [js/submissions.js] (submitCreate) - error in ajax" +
                                    " - jqXHR = " + jqXHR.status +
                                    ", textStatus = " + textStatus +
                                    ", errorThrown = " + errorThrown +
                                    ", responseText = " + jqXHR.responseText);
                        // Extract the error messages from the server.
                        var errorMsg = $.parseJSON(jqXHR.responseText);
                        CONTACTS.validation.displayServerSideErrors("#contacts-add-form", errorMsg);
                    }
                });
            }
        });
        console.log(getCurrentTime() + " [js/submissions.js] (submitCreate) - end");
    };
    CONTACTS.submissions.submitUpdate = function() {
        console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - start");

        $("#contacts-edit-form").submit(function(event) {
            console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate - submit event) - checking if the form is valid");
            // valida o formulário
            CONTACTS.validation.editContactsFormValidator.form();
            // se tiver erro não vai enviar o submit
            if (CONTACTS.validation.editContactsFormValidator.valid()){
                console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate - submit event) - started");
                event.preventDefault();

         
                //  $('#contacts-list-page').remove();

                var contactId = $("#contacts-edit-input-id").val();

                // Transform the form fields into JSON.
                // Must pull from the specific form so that we get the right data in case another form has data in it.
                var serializedForm = $("#contacts-edit-form").serializeObject();
                //console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate - submit event) - serializedForm.birthDate = " + serializedForm.birthDate);
                // Turn the object into a String.
                var contactData = JSON.stringify(serializedForm);
                console.log(contactData)
                console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate - submit event) - contactData = " + contactData);
                var jqxhr = $.ajax({
                    url: restEndpoint + "/editUserJqueryMobile/" + contactId,
                    contentType: "application/json",
                    dataType: "json",
                    data: contactData,
                    type: "PUT"
                }).done(function(data, textStatus, jqXHR) {
                    console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - ajax done");

                    // Reset this flag when the form passes validation.
                    CONTACTS.validation.formEmail = null;

                    // Remove errors display as a part of the validation system.
                    $('.invalid').remove();

                    // Because we turned off the automatic page transition to catch server side error we need to do it ourselves.
                    $("body").pagecontainer("change", "#contacts-list-page");

                }).fail(function(jqXHR, textStatus, errorThrown) {
                    // Remove any errors that are not a part of the validation system.
                    $('.invalid').remove();

                    // Check for server side validation errors.  This should catch the email uniqueness validation.
                    if ((jqXHR.status === 409) || (jqXHR.status === 400)) {
                        console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - error in ajax - " +
                                "Validation error updating contact! " + jqXHR.status);
//                        console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - error in ajax" +
//                                    " - jqXHR = " + jqXHR.status +
//                                    ", textStatus = " + textStatus +
//                                    ", errorThrown = " + errorThrown +
//                                    ", responseText = " + jqXHR.responseText);

                        // Get the contact.
                        var contact = $("#contacts-edit-form")[0];

                        // Extract the error messages from the server.
                        var errorMsg = $.parseJSON(jqXHR.responseText);

                        // We only want to set this flag if there is actual email error.
                        $.each(errorMsg, function(index, val) {
                            if (index === 'email'){
                                // Get the contact email and set it for comparison in the form validation.
                                $.each(contact, function(index, val){
                                    // This will look for an element with the name of 'email' and pull it's value.
                                    if (val.name == "email"){
                                        CONTACTS.validation.formEmail = val.value;
                                        return false;
                                    }
                                });
                            }
                        });

                        // Apply the error to the form.
                        CONTACTS.validation.displayServerSideErrors("#contacts-edit-form", errorMsg);

                        console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - error in ajax - " +
                                "Validation error displayed in the form for the user to fix! ");
                    } else if (jqXHR.status >= 200 && jqXHR.status < 300 || jqXHR.status === 304) {
                        // It should not reach this error as long as the dataType: is not set. Or if it is set to something
                        // like JSON then the Server method must return data.
                        console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - ajax error on 20x with error message: "
                                + errorThrown.message);
                        console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - ajax error because the REST service doesn't return" +
                                "any data and this app expects data.  Fix the REST app or remove the 'dataType:' option from the AJAX call.");

                        // Extract the error messages from the server.
                        var errorMsg = $.parseJSON(jqXHR.responseText);

                        // Apply the error to the form.
                        CONTACTS.validation.displayServerSideErrors("#contacts-edit-form", errorMsg);

                        console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - ajax error on 20x - " +
                                "after displayServerSideErrors()");
                    } else {
                        console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - error in ajax" +
                                    " - jqXHR = " + jqXHR.status +
                                    ", textStatus = " + textStatus +
                                    ", errorThrown = " + errorThrown +
                                    ", responseText = " + jqXHR.responseText);

                        // Extract the error messages from the server.
                        var errorMsg = $.parseJSON(jqXHR.responseText);

                        // Apply the error to the form.
                        CONTACTS.validation.displayServerSideErrors("#contacts-edit-form", errorMsg);
                    }
                });
            }
        });
        console.log(getCurrentTime() + " [js/submissions.js] (submitUpdate) - end");
    };

    /**
     * Attempts to delete a contact using a JAX-RS DELETE.
     */
    CONTACTS.submissions.deleteContact = function() {
        console.log(getCurrentTime() + " [js/submissions.js] (deleteContact) - start");

        $("#confirm-delete-button").click(function(event) {
            console.log(getCurrentTime() + " [js/submissions.js] (deleteContact - submit event) - started");
            // You must not preventDefault on a click on a link as that will prevent it from changing pages.
//            event.preventDefault();

            // Obtain the contact ID, to use in constructing the REST URI.
            var contactId = $("#contacts-edit-input-id").val();

    
            var jqxhr = $.ajax({
                url: restEndpoint + "/" + contactId,
                contentType: "application/json",
                type: "DELETE"
            }).done(function(data, textStatus, jqXHR) {
                console.log(getCurrentTime() + " [js/submissions.js] (deleteContact) - ajax done");

                // Reset this flag when the form passes validation.
                CONTACTS.validation.formEmail = null;

                // Remove errors display as a part of the validation system.
                CONTACTS.validation.editContactsFormValidator.resetForm();

                // Remove errors display as a part of the validation system.
                $('.invalid').remove();

            }).fail(function(jqXHR, textStatus, errorThrown) {
                // Remove any errors that are not a part of the validation system.
                $('.invalid').remove();

                console.log(getCurrentTime() + " [js/submissions.js] (deleteContact) - error in ajax" +
                        " - jqXHR = " + jqXHR.status +
                        ", textStatus = " + textStatus +
                        ", errorThrown = " + errorThrown +
                        ", responseText = " + jqXHR.responseText);

                // Extract the error messages from the server.
                var errorMsg = $.parseJSON(jqXHR.responseText);

                // Apply the error to the form.
                CONTACTS.validation.displayServerSideErrors("#contacts-edit-form", errorMsg);
            });
        });
        console.log(getCurrentTime() + " [js/submissions.js] (deleteContact) - end");
    };

    //Set up each of these event listeners.
    run();
});
