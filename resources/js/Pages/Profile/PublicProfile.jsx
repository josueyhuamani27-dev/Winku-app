import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function PublicProfile({ student, activeServices = [], completedCount = 0, ratingsAvg, ratingsCount = 0, recentRatings = [] }) {
    // Convertimos el string de habilidades (separadas por comas) en un array para pintarlas como etiquetas
    const skillsArray = student.skills ? student.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    return (
        <>
            <Head title={`Perfil de ${student.name}`} />

            <div style={{ minHeight: '100vh', background: '#0d0e12', color: '#fff', fontFamily: 'sans-serif', padding: '40px 20px' }}>
                
                {/* Botón para volver atrás */}
                <div style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>
                    <Link 
                        href={route('dashboard')} 
                        style={{ color: 'var(--green, #00e676)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}
                    >
                        ← Volver al Espacio de Trabajo
                    </Link>
                </div>

                {/* Tarjeta de Perfil Principal */}
                <div style={{ 
                    maxWidth: '600px', 
                    margin: '0 auto', 
                    background: '#15171e', 
                    borderRadius: '12px', 
                    border: '1px solid #222531', 
                    padding: '30px',
                    textAlign: 'center',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                    
                    {/* Foto de Perfil */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        {student.avatar ? (
                            <img 
                                src={`/storage/${student.avatar}`} 
                                alt={student.name} 
                                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green, #00e676)' }} 
                            />
                        ) : (
                            <div style={{ 
                                width: '120px', 
                                height: '120px', 
                                borderRadius: '50%', 
                                background: '#2c3e50', 
                                color: '#fff', 
                                fontSize: '40px', 
                                fontWeight: 'bold', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                border: '3px solid #34495e'
                            }}>
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Nombre y Datos Académicos */}
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>{student.name}</h1>
                    <p style={{ color: 'var(--green, #00e676)', fontWeight: '600', fontSize: '14px', margin: '0 0 5px 0' }}>
                        🎓 {student.career}
                    </p>
                    <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 20px 0' }}>
                        ⏱️ {student.semester}
                    </p>

                    <hr style={{ border: '0', borderTop: '1px solid #222531', marginBottom: '20px' }} />

                    {/* Sobre mí / Descripción */}
                    <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Sobre mí</h3>
                        <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', background: '#0d0e12', padding: '15px', borderRadius: '8px', margin: 0 }}>
                            {student.description}
                        </p>
                    </div>

                    {/* Habilidades Ofrecidas o Buscadas */}
                    <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>Habilidades</h3>
                        {skillsArray.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {skillsArray.map((skill, index) => (
                                    <span key={index} style={{ 
                                        background: 'rgba(0, 230, 118, 0.1)', 
                                        color: 'var(--green, #00e676)', 
                                        padding: '5px 12px', 
                                        borderRadius: '20px', 
                                        fontSize: '12px', 
                                        fontWeight: '600',
                                        border: '1px solid rgba(0, 230, 118, 0.2)'
                                    }}>
                                        💡 {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#666', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                                Este estudiante aún no ha listado sus habilidades.
                            </p>
                        )}
                    </div>

                    {/* RF-24 CA-05: Contacto por WhatsApp */}
                    {student.phone && (
                        <a
                            href={`https://wa.me/51${student.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'block', marginBottom: '25px', padding: '12px',
                                background: 'rgba(37,211,102,0.12)', border: '1px solid #25d366',
                                borderRadius: '8px', color: '#25d366', textAlign: 'center',
                                textDecoration: 'none', fontSize: '14px', fontWeight: '600',
                            }}
                        >
                            💬 Contactar por WhatsApp
                        </a>
                    )}

                    <hr style={{ border: '0', borderTop: '1px solid #222531', marginBottom: '20px' }} />

                    {/* RF-24 CA-03: Reputación */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '25px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fbbf24' }}>
                                {ratingsCount > 0 ? `⭐ ${ratingsAvg}` : 'Nuevo'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#70778b' }}>
                                {ratingsCount > 0 ? `${ratingsCount} valoración(es)` : 'Sin valoraciones'}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--green, #00e676)' }}>
                                {completedCount}
                            </div>
                            <div style={{ fontSize: '12px', color: '#70778b' }}>
                                Servicios completados
                            </div>
                        </div>
                    </div>

                    {/* RF-24 CA-02: Servicios activos */}
                    <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>Servicios activos</h3>
                        {activeServices.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                                Este proveedor no tiene servicios activos en este momento.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {activeServices.map((s) => (
                                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#0d0e12', borderRadius: '8px' }}>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 2px 0' }}>{s.title}</p>
                                            <span style={{ fontSize: '11px', color: 'var(--green, #00e676)' }}>{s.category}</span>
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '700' }}>
                                            S/. {Number(s.price).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RF-24 CA-04: Últimas 5 reseñas */}
                    <div style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>Últimas reseñas</h3>
                        {recentRatings.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                                Aún no ha recibido reseñas.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {recentRatings.map((r) => (
                                    <div key={r.id} style={{ padding: '12px', background: '#0d0e12', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <strong style={{ fontSize: '13px' }}>{r.client?.name || 'Usuario Winkü'}</strong>
                                            <span style={{ fontSize: '13px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                                        </div>
                                        <p style={{ fontSize: '11px', color: '#70778b', margin: '0 0 4px 0' }}>{r.service?.title}</p>
                                        {r.comment && (
                                            <p style={{ fontSize: '13px', color: '#ccc', margin: 0 }}>{r.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}