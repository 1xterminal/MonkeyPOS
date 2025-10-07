document.addEventListener('DOMContentLoaded', function(){
    //getting the member form and inputs
    var memberAddButton = document.getElementById("members-add-button");
    var memberNameInput = document.getElementById("members-add-name");
    var memberPhoneInput = document.getElementById("members-add-phone");
    var memberEmailInput = document.getElementById("members-add-email");

    //getting the members list
    var members;

    //getting the delete button
    const deleteButton = document.getElementById("members-list-delete-button");

    //getting the edit popup
    var editPopup = document.getElementById("members-edit-popup");
    var editPopupClose = document.getElementById("members-edit-close-button");
    var memberEditForm = document.getElementById("members-edit-form");
    var editMemberOriginalEmail = document.getElementById("members-edit-original-email");
    var editMemberName = document.getElementById("members-edit-name");
    var editMemberPhone = document.getElementById("members-edit-phone");
    var editMemberEmail = document.getElementById("members-edit-email");

    //getting the search bar and button
    var searchInput = document.getElementById("member-search-input");
    var searchButton = document.getElementById("member-search-button");

    if(localStorage.getItem("members") != null){
        members = JSON.parse(localStorage.getItem("members"));
    }
    else{
        members = [];
    }

    //getting the table
    const table = document.getElementById("members-list-table");

    //save members to localStorage
    function saveMembers(){
        localStorage.setItem("members", JSON.stringify(members));
    }

    //render table
    function renderMembersTable(membersRendered){
        table.innerHTML = '';
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        var theadContent = '<thead><tr><th>Nomor</th><th>Nama Member</th><th>Nomor Telepon</th><th>Email</th><th>Ubah</th><th>Hapus</th></tr></thead>';
        thead.innerHTML = theadContent;
        table.appendChild(thead);

        //if theres nothing in the members array
        if(membersRendered.length === 0){
            var rowEmpty = '<tr><td colspan="6">Tidak ada member</td></tr>';
            tbody.innerHTML = rowEmpty;
            table.appendChild(tbody)
        }
        else{
            //loop through each member and add it as a new row
            for(var i = 0; i < membersRendered.length; i++){
                var member = membersRendered[i];

                //new row element
                var row = document.createElement('tr')

                //fill the row element
                row.innerHTML = `
                    <td>${i + 1}</td>
                    <td>${member.name}</td>
                    <td>${member.phone}</td>
                    <td>${member.email}</td>
                    <td><button class="members-list-edit-button" data-email="${member.email}">Ubah</button></td>
                    <td><button class="members-list-delete-button" data-email="${member.email}">Hapus</button></td>`

                //append the new row
                tbody.appendChild(row);
            }

            table.appendChild(tbody);
        }
    }

    //adds a new member
    function addMember(name, email, phone){
        //check if theres duplicate members
        for(var i = 0; i < members.length; i++){
            if(members[i].email.toLowerCase() === email.toLowerCase() || members[i].phone.toLowerCase() === phone.toLowerCase()){
                alert("Member sudah ada");
                return;
            }
        }

        //creates a new member
        var newMember = {
            name: name,
            email: email,
            phone: phone
        };

        //add new member to beginning of the members array
        members.unshift(newMember);
        saveMembers();
        renderMembersTable(members);
    }

    //event listener for the add button
    if(memberAddButton){
        memberAddButton.addEventListener("click", function(){
            //getting the values from the form
            var name = memberNameInput.value;
            var email = memberEmailInput.value;
            var phone = memberPhoneInput.value;

            //add member
            addMember(name, email, phone);

            //clear all form fields
            addMemberForm.requestFullscreen();
        });
    }

    //edit popup controller
    function renderEditPopup(email){
        //finds the member
        const memberToEdit = members.find(member => member.email === email);

        if(memberToEdit){
            //get the form fields
            editMemberOriginalEmail.value = memberToEdit.email;
            editMemberName.value = memberToEdit.name;
            editMemberPhone.value = memberToEdit.phone;
            editMemberEmail.value = memberToEdit.email;

            //show the popup
            editPopup.style.display = "block";
        }
    }

    //close the edit popup
    function closeEditPopup(){
        editPopup.style.display = "none";
    }

    //delete member
    function deleteMember(email){
        //new empty array for the updated members list
        var updatedMembers = [];
        for(var i = 0; i < members.length; i++){
            //if the email doesnt match, then put in updated array
            if(members[i].email !== email){
                updatedMembers.push(members[i]);
            }
        }

        //replace old array
        members = updatedMembers;

        //save new array
        saveMembers();

        renderMembersTable(members);
    }

    //event listener for edit and delete buttons
    table.addEventListener('click', function(event) {
        const target = event.target;
        
        //listens if the edit button is clicked
        if(target.classList.contains('members-list-edit-button')){
            const memberToEdit = target.dataset.email;
            renderEditPopup(memberToEdit);
        }

        //listens if the delete button is clicked
        if (target.classList.contains('members-list-delete-button')){
            //gets the email for the member thats about to be deleted
            const memberEmailToDelete = event.target.dataset.email;
            deleteMember(memberEmailToDelete);
        }
    });

    //event listener for the edit form
    if(memberEditForm){
        memberEditForm.addEventListener("submit", function(e){
            e.preventDefault();

            const originalEmail = editMemberOriginalEmail.value;
            const newName = editMemberName.value;
            const newPhone = editMemberPhone.value;
            const newEmail = editMemberEmail.value;

            //validation, make sure theres no duplicates with the other members
            const  isDuplicate = members.some(member => {
                if(member.email === originalEmail){
                    return false;
                }
                return member.email.toLowerCase() === newEmail.toLowerCase() || member.phone === newPhone;
            });

            //if its a duplicate
            if(isDuplicate){
                alert("Informasi sudah ada untuk member lain");
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
    }

    //event listener for the edit popup close button
    if(editPopupClose){
        editPopupClose.addEventListener("click", function(){
            closeEditPopup();
        });
    }

    //closes the popup when clicking outside of the popup
    if(window){
        window.addEventListener("click", function(event){
            if(event.target === editPopup){
                closeEditPopup();
            }
        });
    }

    //search function
    function searchMembers(){
        var searchTerm = searchInput.value.toLowerCase();

        //if the search bar is empty
        if(searchTerm === ''){
            renderMembersTable(members);
            return;
        }

        var filteredMembers = [];
        for(var i = 0; i < members.length; i++){
            var memberNameSearch = members[i].name.toLowerCase();

            if(memberNameSearch.includes(searchTerm)){
                filteredMembers.push(members[i]);
            }
        }

        renderMembersTable(filteredMembers);
    }

    //search using button
    if(searchButton){
        searchButton.addEventListener("click", function(){
            searchMembers();
        });
    }

    //live searching
    if(searchInput){
        searchInput.addEventListener("keyup", function(){
            searchMembers();
        });
    }

    renderMembersTable(members);
});