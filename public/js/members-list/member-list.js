$(document).ready(() => {
    //getting the member form and inputs
    var memberAddForm = $("#members-add-form");
    var memberNameInput = $("#members-add-name");
    var memberPhoneInput = $("#members-add-phone");
    var memberEmailInput = $("#members-add-email");

    //getting the members list
    var members;

    //getting the edit popup
    var editPopup = $("#members-edit-popup");
    var editPopupClose = $("#members-edit-close-button");
    var memberEditForm = $("#members-edit-form");
    var editMemberOriginalEmail = $("#members-edit-original-email");
    var editMemberName = $("#members-edit-name");
    var editMemberPhone = $("#members-edit-phone");
    var editMemberEmail = $("#members-edit-email");

    //getting the search bar and button
    var searchInput = $("#member-search-input");
    var searchButton = $("#member-search-button");

    if(localStorage.getItem("members") != null){
        members = JSON.parse(localStorage.getItem("members"));
    }
    else{
        members = [];
    }

    //getting the table container
    const tableContainer = $(".members-table");

    //save members to localStorage
    function saveMembers(){
        localStorage.setItem("members", JSON.stringify(members));
    }

    //render table
    function renderMembersTable(membersRendered){
        //define columns for the member table
        const tableColumns = [
            { key: "name", label: "Nama Member" },
            { key: "phone", label: "Nomor Telepon" },
            { key: "email", label: "Email" }
        ];

        //define the table actions (buttons for each row)
        const tableActions = [
            {
                label: "Ubah",
                icon: "edit",
                className: "members-list-edit-button",
                onClick: (row) => renderEditPopup(row.email)
            },
            {
                label: "Hapus",
                icon: "delete",
                className: "members-list-delete-button",
                onClick: (row) => deleteMember(row.email)
            }
        ];
        
        //create table using the external component
        createTable(tableContainer, tableColumns, membersRendered, tableActions);
    }

    //adds a new member
    function addMember(name, email, phone){
        //check if theres duplicate members
        const isDuplicate = members.some(m => m.email.toLowerCase() === email.toLowerCase() || m.phone === phone);
        if (isDuplicate) {
            alert("Member dengan email atau nomor telepon tersebut sudah ada.");
            return;
        }

        //creates a new member
        var newMember = { name, email, phone };

        //add new member to beginning of the members array
        members.unshift(newMember);
        saveMembers();
        renderMembersTable(members);
    }

    //event listener for the add form submission
    memberAddForm.on("submit", function(e){
        e.preventDefault();
        
        //getting the values from the form
        var name = memberNameInput.val();
        var email = memberEmailInput.val();
        var phone = memberPhoneInput.val();

        //add member
        addMember(name, email, phone);

        //clear all form fields
        memberAddForm[0].reset();
    });

    //edit popup controller
    function renderEditPopup(email){
        //finds the member
        const memberToEdit = members.find(member => member.email === email);
        if(memberToEdit){
            //get the form fields and populate them
            editMemberOriginalEmail.val(memberToEdit.email);
            editMemberName.val(memberToEdit.name);
            editMemberPhone.val(memberToEdit.phone);
            editMemberEmail.val(memberToEdit.email);

            //show the popup
            editPopup.show();
        }
    }

    //close the edit popup
    function closeEditPopup(){
        editPopup.hide();
    }

    //delete member
    function deleteMember(email){
        if (confirm("Apakah Anda yakin ingin menghapus member ini?")) {
            //replace old array with a new one excluding the deleted member
            members = members.filter(m => m.email !== email);
            //save new array
            saveMembers();
            renderMembersTable(members);
        }
    }

    //event listener for the edit form
    memberEditForm.on("submit", function(e){
        e.preventDefault();

        const originalEmail = editMemberOriginalEmail.val();
        const newName = editMemberName.val();
        const newPhone = editMemberPhone.val();
        const newEmail = editMemberEmail.val();

        //validation, make sure theres no duplicates with the other members
        const isDuplicate = members.some(member => 
            member.email !== originalEmail && (member.email.toLowerCase() === newEmail.toLowerCase() || member.phone === newPhone)
        );

        if(isDuplicate){
            alert("Informasi email atau telepon sudah digunakan oleh member lain.");
            return;
        }
        
        //finds the member to update for
        const memberToUpdate = members.find(member => member.email === originalEmail);
        if(memberToUpdate){
            //updates the member
            memberToUpdate.name = newName;
            memberToUpdate.phone = newPhone;
            memberToUpdate.email = newEmail;
            saveMembers();
            renderMembersTable(members);
            closeEditPopup();
        }
    });

    //event listener for the edit popup close button
    editPopupClose.on("click", closeEditPopup);

    //closes the popup when clicking outside of the popup
    $(window).on("click", function(event){
        if($(event.target).is(editPopup)){
            closeEditPopup();
        }
    });

    //search function
    function searchMembers(){
        var searchTerm = searchInput.val().toLowerCase();

        //if the search bar is empty
        if(searchTerm === ''){
            renderMembersTable(members);
            return;
        }

        var filteredMembers = members.filter(member => 
            member.name.toLowerCase().includes(searchTerm)
        );

        renderMembersTable(filteredMembers);
    }

    //search using button
    searchButton.on("click", searchMembers);

    //live searching
    searchInput.on("keyup", searchMembers);

    renderMembersTable(members);
});