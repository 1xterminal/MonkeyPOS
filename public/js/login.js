document.addEventListener('DOMContentLoaded', function() {
    /* Mengambil elemen-elemen dari HTML dengan Id */
    const loginForm = document.getElementById('login-form');
    const idInput = document.getElementById('employee-id');
    const passInput = document.getElementById('password');
    const errormsg = document.getElementById('error-message');
    
    loginForm.addEventListener('submit', function(event) {
        /* Mencegah refresh halaman */
        event.preventDefault();

        const employeeId = idInput.value.trim();
        const password = passInput.value.trim();

        /* Memeriksa apakah form kosong */
        if (employeeId === '' || password === '') {
            errormsg.textContent = 'ID Karyawan dan Kata Sandi tidak boleh kosong!';
            return;
        }

        /* Memeriksa apakah id dan password benar */
        if (employeeId === 'EMP1234' && password === 'admin123') {
            alert('Login Berhasil!')

            /* Menyimpan status login ke local storage */
            localStorage.setItem('user', employeeId);
            
            /* Mengarahkan user ke halaman berikutnya */
            window.location.href = 'dashboard.html';
        } else {
            errormsg.textContent = 'ID Karyawan atau Kata Sandi Salah!';
        }
    });
});