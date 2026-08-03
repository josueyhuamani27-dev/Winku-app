import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Navbar from '@/Components/Navbar';

// ═══════════════════════════════════════════════════════════════════
// RF-17: Formulario de valoración post-servicio
// Vive aquí (no en Welcome.jsx) porque necesita el service_request
// completo (id, status), que es lo que esta página maneja.
// ═══════════════════════════════════════════════════════════════════
function RatingForm({ serviceRequestId }) {
    const [rating, setRating]   = useState(0);
    const [hover, setHover]     = useState(0);
    const [comment, setComment] = useState('');
    const [sent, setSent]       = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return;
        router.post(route('service-requests.rating.store', serviceRequestId), {
            rating,
            comment,
        }, {
            preserveScroll: true,
            onSuccess: () => setSent(true),
        });
    };

    if (sent) {
        return (
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(52,211,153,0.1)', border: '1px solid var(--green)', borderRadius: 'var(--radius-sm)', color: 'var(--green)', textAlign: 'center', fontSize: '13px' }}>
                ✓ ¡Gracias por tu valoración!
            </div>
        );
    }

    return (
        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--card2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>Valorar este servicio:</p>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {[1,2,3,4,5].map((star) => (
                        <span
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            style={{ fontSize: '22px', cursor: 'pointer', color: star <= (hover || rating) ? '#fbbf24' : 'var(--border)' }}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    maxLength={500}
                    placeholder="Comentario opcional..."
                    rows={2}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: 'var(--radius-sm)', fontSize: '12px', resize: 'none', boxSizing: 'border-box', outline: 'none' }}
                />
                <button
                    type="submit"
                    disabled={rating === 0}
                    className="btn-sm g"
                    style={{ marginTop: '8px', padding: '6px 16px', fontSize: '12px', opacity: rating === 0 ? 0.5 : 1 }}
                >
                    Enviar valoración
                </button>
            </form>
        </div>
    );
}

// RF-12 CA-04: Estados disponibles para el filtro

// RF-12 CA-04: Estados disponibles para el filtro
const STATUS_OPTIONS = [
    { value: '',            label: '🌐 Todas' },
    { value: 'pending',     label: 'Pendiente' },
    { value: 'accepted',    label: 'Aceptada' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'completed',   label: 'Completada' },
    { value: 'rejected',    label: 'Rechazada' },
    { value: 'cancelled',   label: 'Cancelada' },
    { value: 'disputed',    label: 'En disputa' },
];

const STATUS_STYLE = {
    pending:     { bg: 'rgba(251,191,36,0.15)',  color: 'var(--amber, #fbbf24)' },
    accepted:    { bg: 'rgba(52,211,153,0.15)',  color: 'var(--green, #34d399)' },
    in_progress: { bg: 'rgba(56,189,248,0.15)',  color: '#38bdf8' },
    completed:   { bg: 'rgba(52,211,153,0.15)',  color: 'var(--green, #34d399)' },
    rejected:    { bg: 'rgba(232,67,147,0.15)',  color: 'var(--pink)' },
    cancelled:   { bg: 'rgba(148,163,184,0.15)', color: 'var(--muted)' },
    disputed:    { bg: 'rgba(232,67,147,0.15)',  color: 'var(--pink)' },
};

const STATUS_LABEL = {
    pending: 'Pendiente', accepted: 'Aceptada', in_progress: 'En progreso',
    completed: 'Completada', rejected: 'Rechazada', cancelled: 'Cancelada', disputed: 'En disputa',
};

export default function MyRequests({ auth, myRequests = [], filters = {} }) {
    const [activeStatus, setActiveStatus] = useState(filters?.status ?? '');

    // RF-09 / RF-13 CA-01, CA-02: el cliente confirma la entrega satisfactoria
    const handleCompleteRequest = (id) => {
        if (confirm('¿Confirmas que el servicio fue entregado satisfactoriamente? Esta acción habilitará tu valoración y no se puede deshacer.')) {
            router.patch(route('service-requests.complete', id), {}, { preserveScroll: true });
        }
    };

    // RF-09 / RF-13 CA-05: el cliente abre una disputa en lugar de confirmar
    const handleDisputeRequest = (id) => {
        const reason = prompt('¿Qué salió mal? Cuéntanos el motivo de tu disputa:');
        if (reason && reason.trim() !== '') {
            router.patch(route('service-requests.dispute', id), { dispute_reason: reason }, { preserveScroll: true });
        }
    };

    // CA-04: al elegir un filtro, recarga solo los datos necesarios (partial reload)
    const handleFilter = (status) => {
        setActiveStatus(status);
        router.get(route('service-requests.index'), { status }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['myRequests', 'filters'],
        });
    };

    return (
        <>
            <Head title="Winkü | Mis Solicitudes" />

            <div id="app">
                <div className="andean-strip"></div>

                {/* NAVBAR */}
                <Navbar subtitle="| Mis Solicitudes">
                    <Link href={route('dashboard')} className="btn-sm">Volver a Mi Panel</Link>
                </Navbar>

                {/* CONTENIDO */}
                <main style={{ padding: '50px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                    <h2 className="t-display" style={{ fontSize: '32px', marginBottom: '30px' }}>
                        Solicitudes que has enviado
                    </h2>

                    {/* CA-04: FILTRO POR ESTADO */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {STATUS_OPTIONS.map((opt) => {
                            const isActive = activeStatus === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleFilter(opt.value)}
                                    className={`btn-sm ${isActive ? 'g' : ''}`}
                                    style={{ background: isActive ? '' : 'var(--card2)', border: isActive ? '' : '1px solid var(--border)', whiteSpace: 'nowrap' }}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* CA-01, CA-03: HISTORIAL */}
                    <div className="p-card" style={{ padding: '40px' }}>
                        {myRequests.length === 0 ? (
                            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
                                No tienes solicitudes {activeStatus ? `en estado "${STATUS_LABEL[activeStatus]}"` : 'enviadas'} todavía.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {myRequests.map((req) => {
                                    const style = STATUS_STYLE[req.status] || {};
                                    return (
                                        <div key={req.id} style={{ padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
                                                    {req.service?.title || 'Servicio eliminado'}
                                                </h4>
                                                <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '6px' }}>
                                                    Proveedor: <strong>{req.provider?.name || 'Usuario'}</strong>
                                                </p>
                                                {req.message && (
                                                    <p style={{ color: 'var(--muted)', fontSize: '13px', fontStyle: 'italic', marginBottom: '6px' }}>
                                                        "{req.message}"
                                                    </p>
                                                )}
                                                {req.status === 'rejected' && req.rejection_reason && (
                                                    <p style={{ color: 'var(--pink)', fontSize: '13px', marginBottom: '6px' }}>
                                                        Motivo: {req.rejection_reason}
                                                    </p>
                                                )}
                                                {req.status === 'disputed' && req.dispute_reason && (
                                                    <p style={{ color: 'var(--pink)', fontSize: '13px', marginBottom: '6px' }}>
                                                        Tu reporte: {req.dispute_reason}
                                                    </p>
                                                )}
                                                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                                                    {new Date(req.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                                {/* RF-09 / RF-13 CA-01: solo el cliente, solo si accepted/in_progress */}
                                                {(req.status === 'accepted' || req.status === 'in_progress') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleCompleteRequest(req.id)}
                                                            className="btn-sm g"
                                                            style={{ fontSize: '12px' }}
                                                        >
                                                            ✓ Confirmar entrega
                                                        </button>
                                                        <button
                                                            onClick={() => handleDisputeRequest(req.id)}
                                                            className="btn-sm"
                                                            style={{ fontSize: '12px', background: 'rgba(232,67,147,0.1)', color: 'var(--pink)', border: '1px solid var(--pink)' }}
                                                        >
                                                            ⚠ Reportar problema
                                                        </button>
                                                    </>
                                                )}
                                                <span style={{
                                                    padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                                                    background: style.bg, color: style.color,
                                                }}>
                                                    {STATUS_LABEL[req.status] || req.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* RF-17 CA-04/CA-05: formulario solo si completed Y aún no valorada */}
                                        {req.status === 'completed' && !req.rating && (
                                            <RatingForm serviceRequestId={req.id} />
                                        )}

                                        {/* Ya valorada: mostrar lo que el cliente puso, de solo lectura */}
                                        {req.status === 'completed' && req.rating && (
                                            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--card2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>Tu valoración:</p>
                                                <div style={{ fontSize: '18px', marginBottom: req.rating.comment ? '6px' : '0' }}>
                                                    {'★'.repeat(req.rating.rating)}{'☆'.repeat(5 - req.rating.rating)}
                                                </div>
                                                {req.rating.comment && (
                                                    <p style={{ fontSize: '13px', color: 'var(--text)' }}>{req.rating.comment}</p>
                                                )}
                                            </div>
                                        )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </>
    );
}