import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

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
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' };
const errorStyle = { color: 'var(--pink)', fontSize: '12px', marginTop: '4px' };

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <h3 className="t-title" style={{ marginBottom: '10px', fontSize: '20px', color: 'var(--violet-lt)' }}>
                Actualizar contraseña
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '25px' }}>
                Usa una contraseña larga y única para mantener segura tu cuenta.
            </p>

            <form onSubmit={updatePassword}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="current_password" style={labelStyle}>Contraseña actual</label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        autoComplete="current-password"
                        style={inputStyle(errors.current_password)}
                    />
                    {errors.current_password && <p style={errorStyle}>{errors.current_password}</p>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="password" style={labelStyle}>Nueva contraseña</label>
                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        style={inputStyle(errors.password)}
                    />
                    {errors.password && <p style={errorStyle}>{errors.password}</p>}
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label htmlFor="password_confirmation" style={labelStyle}>Confirmar contraseña</label>
                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        autoComplete="new-password"
                        style={inputStyle(errors.password_confirmation)}
                    />
                    {errors.password_confirmation && <p style={errorStyle}>{errors.password_confirmation}</p>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button type="submit" disabled={processing} className="btn-sm g" style={{ padding: '12px 30px', fontSize: '16px' }}>
                        {processing ? 'Guardando...' : 'Guardar'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p style={{ color: 'var(--green)', fontSize: '14px' }}>Guardado.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}