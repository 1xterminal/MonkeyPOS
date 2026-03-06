$(document).ready(() => {
    // === ELEMEN DOM ===
    const memberAddForm = document.getElementById("members-add-form");
    const memberNameInput = document.getElementById("members-add-name");
    const memberPhoneInput = document.getElementById("members-add-phone");
    const memberEmailInput = document.getElementById("members-add-email");
    const tableContainer = document.querySelector(".members-table");

    // Popup Edit
    const editPopup = document.getElementById("members-edit-popup");
    const editCloseBtn = document.getElementById("members-edit-close-button");
    const editForm = document.getElementById("members-edit-form");

    // Search
    const searchInput = document.getElementById("member-search-input");
    const searchButton = document.getElementById("member-search-button");

    // === STATE ===
    // DIUBAH: Menggunakan Storage helper
    let members = Storage.getLocal("members", []);

    // === FUNGSI ===

    // DIUBAH: Menggunakan Storage helper
    function saveMembers() {
        Storage.setLocal("members", members);
    }

    function renderTable(dataToRender) {
        // Hapus tabel lama jika ada
        if (tableContainer.firstChild) {
            tableContainer.removeChild(tableContainer.firstChild);
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nama Member</th>
                    <th>Nomor Telepon</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${dataToRender.length === 0 
                    ? `<tr><td colspan="5" style="text-align: center;">Tidak ada member.</td></tr>`
                    : dataToRender.map((member, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${member.name}</td>
                            <td>${member.phone}</td>
                            <td>${member.email}</td>
                            <td class="table-actions">
                                <button class="action-btn btn-edit" data-email="${member.email}"><span class="material-symbols-outlined small">edit</span> Ubah</button>
                                <button class="action-btn btn-delete" data-email="${member.email}"><span class="material-symbols-outlined small">delete</span> Hapus</button>
                            </td>
                        </tr>
                    `).join('')
                }
            </tbody>
        `;
        tableContainer.appendChild(table);
    }

    function addMember(name, email, phone) {
        const isDuplicate = members.some(m => m.email.toLowerCase() === email.toLowerCase() || m.phone === phone);
        if (isDuplicate) {
            alert("Member dengan email atau nomor telepon tersebut sudah ada.");
            return;
        }
        members.unshift({ name, email, phone });
        saveMembers();
        renderTable(members);
        memberAddForm.reset();
    }

    function deleteMember(email) {
        if (confirm("Apakah Anda yakin ingin menghapus member ini?")) {
            members = members.filter(m => m.email !== email);
            saveMembers();
            renderTable(members);
        }
    }

    function openEditPopup(email) {
        const member = members.find(m => m.email === email);
        if (member) {
            $("#members-edit-original-email").val(member.email);
            $("#members-edit-name").val(member.name);
            $("#members-edit-email").val(member.email);
            $("#members-edit-phone").val(member.phone);
            editPopup.style.display = 'flex';
        }
    }

    function closeEditPopup() {
        editPopup.style.display = 'none';
    }

    function updateMember(originalEmail, newData) {
        const isDuplicate = members.some(m => 
            m.email !== originalEmail && (m.email.toLowerCase() === newData.email.toLowerCase() || m.phone === newData.phone)
        );
        if (isDuplicate) {
            alert("Informasi email atau telepon sudah digunakan oleh member lain.");
            return;
        }
        const memberIndex = members.findIndex(m => m.email === originalEmail);
        if (memberIndex !== -1) {
            members[memberIndex] = { ...members[memberIndex], ...newData };
            saveMembers();
            renderTable(members);
            closeEditPopup();
        }
    }
    
    function searchMembers() {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = members.filter(m => 
            m.name.toLowerCase().includes(searchTerm) ||
            m.email.toLowerCase().includes(searchTerm) ||
            m.phone.includes(searchTerm)
        );
        renderTable(filtered);
    }

    // === EVENT LISTENERS ===
    
    memberAddForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addMember(memberNameInput.value, memberEmailInput.value, memberPhoneInput.value);
    });

    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        updateMember(
            $("#members-edit-original-email").val(),
            {
                name: $("#members-edit-name").val(),
                email: $("#members-edit-email").val(),
                phone: $("#members-edit-phone").val()
            }
        );
    });
    
    tableContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.action-btn');
        if (!target) return;

        const email = target.dataset.email;
        if (target.classList.contains('btn-edit')) {
            openEditPopup(email);
        }
        if (target.classList.contains('btn-delete')) {
            deleteMember(email);
        }
    });

    editCloseBtn.addEventListener('click', closeEditPopup);
    editPopup.addEventListener('click', (e) => {
        if (e.target === editPopup) closeEditPopup();
    });
    
    searchButton.addEventListener('click', searchMembers);
    searchInput.addEventListener('keyup', searchMembers);

    // === INISIALISASI ===
    renderTable(members);
});