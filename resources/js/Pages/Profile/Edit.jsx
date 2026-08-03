import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth?.user;

    return (
        <>
            <Head title="Winkü | Mi Perfil" />

            <div id="app">
                <div className="andean-strip"></div>

                <Navbar subtitle="| Mi Perfil">
                    <Link href={route('dashboard')} className="btn-sm">
                        Volver a Mi Panel
                    </Link>
                </Navbar>

                <main style={{ padding: '50px 40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                        {user?.avatar ? (
                            <img
                                src={`/storage/${user.avatar}`}
                                alt={user.name}
                                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green)' }}
                            />
                        ) : (
                            <div className="av v" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <div>
                            <h2 className="t-display" style={{ fontSize: '28px', margin: 0 }}>
                                Mi perfil
                            </h2>
                            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
                                Así te ven tus compañeros y clientes de la UNSCH.
                            </p>
                        </div>
                    </div>

                    <div className="p-card" style={{ padding: '40px', marginBottom: '24px' }}>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div className="p-card" style={{ padding: '40px', marginBottom: '24px' }}>
                        <UpdatePasswordForm />
                    </div>

                    <div className="p-card" style={{ padding: '40px' }}>
                        <DeleteUserForm />
                    </div>

                </main>
            </div>
        </>
    );
}