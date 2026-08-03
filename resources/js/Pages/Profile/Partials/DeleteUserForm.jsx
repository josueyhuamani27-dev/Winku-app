import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

const inputStyle = (hasError) => ({
    width: '100%',
    background: 'var(--bg)',
    border: hasError ? '1px solid var(--pink)' : '1px solid var(--border)',
    color: '#fff',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    boxSizing: 'border-box',
});

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={className}>
            <h3 className="t-title" style={{ marginBottom: '10px', fontSize: '20px', color: 'var(--pink)' }}>
                Eliminar cuenta
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '25px' }}>
                Una vez eliminada tu cuenta, todos tus datos y publicaciones se borrarán permanentemente.
                Antes de continuar, descarga cualquier información que quieras conservar.
            </p>

            <button
                onClick={confirmUserDeletion}
                className="btn-sm"
                style={{ padding: '12px 24px', fontSize: '15px', background: 'rgba(232,67,147,0.1)', color: 'var(--pink)', border: '1px solid var(--pink)' }}
            >
                Eliminar cuenta
            </button>

            {confirmingUserDeletion && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="p-card" style={{ width: '100%', maxWidth: '500px', padding: '30px' }}>
                        <form onSubmit={deleteUser}>
                            <h3 className="t-title" style={{ marginBottom: '10px', fontSize: '18px', color: 'var(--pink)' }}>
                                ¿Seguro que quieres eliminar tu cuenta?
                            </h3>

                            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
                                Esta acción no se puede deshacer. Ingresa tu contraseña para confirmar
                                que deseas eliminar tu cuenta de forma permanente.
                            </p>

                            <div style={{ marginBottom: '20px' }}>
                                <input
                                    id="password"
                                    type="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Contraseña"
                                    autoFocus
                                    style={inputStyle(errors.password)}
                                />
                                {errors.password && (
                                    <p style={{ color: 'var(--pink)', fontSize: '12px', marginTop: '4px' }}>
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn-sm"
                                    style={{ padding: '10px 20px', background: 'var(--bg)', border: '1px solid var(--border)' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn-sm"
                                    style={{ padding: '10px 20px', background: 'rgba(232,67,147,0.15)', color: 'var(--pink)', border: '1px solid var(--pink)' }}
                                >
                                    Eliminar cuenta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}