document.addEventListener('DOMContentLoaded', () => {
    
    $loginForm = $('login-form');
    $empId = $('employee-id');
    $pass = $('password');
    $errorMessage = $('login-error-message');

    $loginForm.addEventListener('submit', (event) => {
        // Mencegah form reload halaman berulang
        event.preventDefault();

        // Mengambil value dari elemen yang di input
        const employeeId = $empId.val();
        const password = $pass.val();

        // Menghilangkan pesan error
        $errorMessage.text('');

        // Validasi sederhana: pastikan input tidak kosong
        if (employeeId === '' || password === '') {
            $errorMessage.text('ID Karyawan dan Kata Sandi tidak boleh kosong.');
            return;
        }

        // Ambil data pengguna dari localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Cari pengguna yang cocok dengan ID dan password yang dimasukkan
        const foundUser = users.find(user => user.id === employeeId && user.password === password);
        if (foundUser) {
            console.log('Login berhasil untuk user:', foundUser.name);

            // Menyimpan data pengguna ke sessionStorage
            const currentUser = {
                id: foundUser.id,
                name: foundUser.name,
            };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Akan diarahkan pengguna ke halaman dashboard setelah berhasil login
            window.location.href = '../dashboard/dashboard.html';

        } else {
            $errorMessage.text('ID Karyawan atau Kata Sandi salah.');
        }
    });

});
