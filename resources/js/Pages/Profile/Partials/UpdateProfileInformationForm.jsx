import { usePage, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Estilos reutilizados, consistentes con el resto de formularios de Winkü
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

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const { props } = usePage();
    const user = props.auth?.user || {};

    // ── Estado local con useState — se actualiza cada vez que user cambia ──
    const [values, setValues] = useState({
        name:        user.name        || '',
        email:       user.email       || '',
        career:      user.career      || '',
        semester:    user.semester    || '',
        description: user.description || '',
        skills:      user.skills      || '',
        phone:       user.phone       || '',
    });
    const [avatar, setAvatar]               = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors]               = useState({});
    const [processing, setProcessing]       = useState(false);
    const [success, setSuccess]             = useState(false);

    // Sincroniza los campos cada vez que Inertia actualiza auth.user
    useEffect(() => {
        if (!user.name) return;
        setValues({
            name:        user.name        || '',
            email:       user.email       || '',
            career:      user.career      || '',
            semester:    user.semester    || '',
            description: user.description || '',
            skills:      user.skills      || '',
            phone:       user?.phone || '',
        });
    }, [
        user.name,
        user.email,
        user.career,
        user.semester,
        user.description,
        user.skills,
        user.phone,
    ]);

    const handleChange = (field) => (e) => {
        setValues(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleAvatar = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setSuccess(false);

        // Construir FormData manualmente para control total
        const formData = new FormData();
        formData.append('_method', 'PATCH');
        formData.append('name',        values.name);
        formData.append('email',       values.email);
        formData.append('career',      values.career);
        formData.append('semester',    values.semester);
        formData.append('description', values.description);
        formData.append('skills',      values.skills);
        formData.append('phone',  values.phone || '');
        if (avatar) {
            formData.append('avatar', avatar);
        }

        try {
            // Usamos axios directamente — evita el problema de Inertia
            // con la re-inicialización de useForm
            await axios.post('/profile', formData, {
                headers: {
                    'X-CSRF-TOKEN': props.csrf_token ||
                        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                },
            });

            setSuccess(true);
            setAvatar(null);

            // Visita la misma página para que Inertia actualice auth.user
            // con los datos frescos del servidor
            router.visit(route('profile.edit'), {
                preserveScroll: true,
                onSuccess: () => {
                    setSuccess(true);
                },
            });

        } catch (err) {
            if (err.response?.status === 422) {
                // Errores de validación de Laravel
                setErrors(err.response.data.errors || {});
            } else {
                console.error('Error al guardar perfil:', err);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <section className={className}>
            <h3 className="t-title" style={{ marginBottom: '10px', fontSize: '20px', color: 'var(--violet-lt)' }}>
                Información del perfil académico
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '25px' }}>
                Actualiza los datos de tu perfil universitario y tu foto (máx. 2 MB).
            </p>

            <form onSubmit={submit}>

                {/* FOTO DE PERFIL */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Foto de perfil (opcional)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Vista previa"
                                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green)' }}
                            />
                        ) : user.avatar ? (
                            <img
                                src={`/storage/${user.avatar}`}
                                alt="Avatar"
                                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green)' }}
                            />
                        ) : (
                            <div className="av v" style={{ width: '64px', height: '64px', fontSize: '22px' }}>
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatar}
                            style={{ fontSize: '13px', color: 'var(--muted)' }}
                        />
                    </div>
                    {errors.avatar && <p style={errorStyle}>{errors.avatar[0]}</p>}
                </div>

                {/* NOMBRE */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="name" style={labelStyle}>Nombre completo *</label>
                    <input
                        id="name"
                        type="text"
                        value={values.name}
                        onChange={handleChange('name')}
                        required
                        autoComplete="name"
                        style={inputStyle(errors.name)}
                    />
                    {errors.name && <p style={errorStyle}>{errors.name[0]}</p>}
                </div>

                {/* CARRERA */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="career" style={labelStyle}>Carrera profesional / escuela *</label>
                    <input
                        id="career"
                        type="text"
                        value={values.career}
                        placeholder="Ej. Ingeniería de Sistemas, Derecho, Administración..."
                        onChange={handleChange('career')}
                        required
                        style={inputStyle(errors.career)}
                    />
                    {errors.career && <p style={errorStyle}>{errors.career[0]}</p>}
                </div>

                {/* SEMESTRE */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="semester" style={labelStyle}>Semestre académico actual *</label>
                    <select
                        id="semester"
                        value={values.semester}
                        onChange={handleChange('semester')}
                        required
                        style={inputStyle(errors.semester)}
                    >
                        <option value="">-- Selecciona tu semestre --</option>
                        <option value="I Semestre">I Semestre</option>
                        <option value="II Semestre">II Semestre</option>
                        <option value="III Semestre">III Semestre</option>
                        <option value="IV Semestre">IV Semestre</option>
                        <option value="V Semestre">V Semestre</option>
                        <option value="VI Semestre">VI Semestre</option>
                        <option value="VII Semestre">VII Semestre</option>
                        <option value="VIII Semestre">VIII Semestre</option>
                        <option value="IX Semestre">IX Semestre</option>
                        <option value="X Semestre">X Semestre</option>
                        <option value="Egresado">Egresado / Graduado</option>
                    </select>
                    {errors.semester && <p style={errorStyle}>{errors.semester[0]}</p>}
                </div>

                {/* EMAIL */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="email" style={labelStyle}>Correo electrónico *</label>
                    <input
                        id="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange('email')}
                        required
                        autoComplete="username"
                        style={inputStyle(errors.email)}
                    />
                    {errors.email && <p style={errorStyle}>{errors.email[0]}</p>}
                </div>

                {/* DESCRIPCIÓN */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="description" style={labelStyle}>Descripción / presentación</label>
                    <textarea
                        id="description"
                        rows="3"
                        value={values.description}
                        placeholder="Cuéntale a la comunidad quién eres y qué servicios ofreces o buscas..."
                        onChange={handleChange('description')}
                        style={{ ...inputStyle(errors.description), resize: 'none' }}
                    />
                    {errors.description && <p style={errorStyle}>{errors.description[0]}</p>}
                </div>

                {/* HABILIDADES */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="skills" style={labelStyle}>Habilidades (separadas por comas)</label>
                    <input
                        id="skills"
                        type="text"
                        value={values.skills}
                        placeholder="Ej: Matemáticas, React, Oratoria, Diseño Gráfico, Excel"
                        onChange={handleChange('skills')}
                        style={inputStyle(errors.skills)}
                    />
                    <small style={{ color: 'var(--muted)', display: 'block', marginTop: '4px', fontSize: '12px' }}>
                        Escribe tus habilidades separadas por comas.
                    </small>
                    {errors.skills && <p style={errorStyle}>{errors.skills[0]}</p>}
                </div>

                {/* WHATSAPP */}
                <div style={{ marginBottom: '30px' }}>
                    <label htmlFor="phone" style={labelStyle}>Número de WhatsApp (sin +51)</label>
                    <input
                        id="phone"
                        type="tel"
                        value={values.phone || ''}
                        onChange={handleChange('phone')}
                        placeholder="Ej: 987654321"
                        maxLength={20}
                        style={inputStyle(errors.phone)}
                    />
                    <small style={{ color: 'var(--muted)', display: 'block', marginTop: '4px', fontSize: '12px' }}>
                        Solo el número sin código de país. Ej: 987654321
                    </small>
                    {errors.phone && <p style={errorStyle}>{errors.phone[0]}</p>}
                </div>

                {/* BOTÓN */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button type="submit" disabled={processing} className="btn-sm g" style={{ padding: '12px 30px', fontSize: '16px' }}>
                        {processing ? 'Guardando...' : 'Guardar cambios'}
                    </button>

                    <Transition
                        show={success}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p style={{ color: 'var(--green)', fontSize: '14px' }}>
                            ¡Perfil actualizado con éxito!
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}