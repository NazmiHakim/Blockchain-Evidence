import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config';

const DashboardSatgas = () => {
  const navigate = useNavigate();
  const { account } = useWallet();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, submitted: 0, underInvestigation: 0, resolved: 0 });
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | '0' | '1' | '2'

  // State untuk Role Admin Kontrak
  const [isAdmin, setIsAdmin] = useState(false);
  const [whitelistAddress, setWhitelistAddress] = useState('');
  const [adminUpdating, setAdminUpdating] = useState(false);

  const STATUS_TEXT = ['SUBMITTED', 'SEDANG DIPROSES', 'SELESAI'];
  const STATUS_COLORS = ['#4D6CFA', '#FFFF2E', '#27AE60'];

  useEffect(() => {
    if (!account) {
      navigate('/403');
      return;
    }

    const verifyRoleAndFetch = async () => {
      setLoading(true);
      setError('');
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask belum terpasang.');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // 1. Cek apakah wallet terhubung adalah Admin Kontrak
        const adminAddress = await contract.admin();
        const isUserAdmin = account.toLowerCase() === adminAddress.toLowerCase();
        setIsAdmin(isUserAdmin);

        // 2. Cek apakah wallet terhubung adalah Satgas PPKS
        const isUserSatgas = await contract.isSatgas(account);

        // Proteksi: Admin atau Satgas diizinkan masuk. Wallet lain dilempar ke /403
        if (!isUserAdmin && !isUserSatgas) {
          navigate('/403');
          return;
        }

        // 3. Ambil total laporan dinamis dari blockchain
        const count = await contract.getReportCount();
        const fetchedList = [];
        let subCount = 0;
        let invCount = 0;
        let resCount = 0;

        for (let i = 1; i <= Number(count); i++) {
          const rawReport = await contract.reports(BigInt(i));
          if (rawReport.reporter !== ethers.ZeroAddress) {
            const formatted = {
              id: Number(rawReport.id),
              reporter: rawReport.reporter,
              ipfsHash: rawReport.ipfsHash,
              fileType: rawReport.fileType,
              timestamp: Number(rawReport.timestamp),
              status: Number(rawReport.status)
            };
            
            fetchedList.push(formatted);

            if (formatted.status === 0) subCount++;
            else if (formatted.status === 1) invCount++;
            else if (formatted.status === 2) resCount++;
          }
        }

        // Urutkan laporan terbaru di atas (descending by ID)
        fetchedList.sort((a, b) => b.id - a.id);

        setReports(fetchedList);
        setStats({
          total: fetchedList.length,
          submitted: subCount,
          underInvestigation: invCount,
          resolved: resCount
        });
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
        setError(err.message || 'Gagal menyinkronkan data dengan blockchain.');
      } finally {
        setLoading(false);
      }
    };

    verifyRoleAndFetch();
  }, [account, navigate]);

  // Fungsi khusus Admin Kontrak untuk mengelola whitelist Satgas
  const handleWhitelist = async (status) => {
    if (!whitelistAddress.trim() || !ethers.isAddress(whitelistAddress)) {
      alert("Masukkan alamat wallet Ethereum (0x...) yang valid!");
      return;
    }

    setAdminUpdating(true);
    try {
      // Panggil transaksi menggunakan signer pelapor/admin
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.whitelistSatgas(whitelistAddress.trim(), status);
      await tx.wait();

      alert(`Berhasil ${status ? 'menambahkan ke whitelist' : 'mencabut akses'} untuk wallet:\n${whitelistAddress}`);
      setWhitelistAddress('');
    } catch (err) {
      console.error("Gagal memperbarui whitelist:", err);
      alert("Gagal memperbarui whitelist: " + (err.reason || err.message));
    } finally {
      setAdminUpdating(false);
    }
  };

  // Filter laporan berdasarkan pilihan tab status
  const filteredReports = reports.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status.toString() === filterStatus;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '15px', color: '#ccc' }}>Memverifikasi hak akses & menyinkronkan data blockchain...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <p style={{ color: 'var(--royal-blue)', fontWeight: 'bold', fontSize: '14px', margin: '0 0 5px', letterSpacing: '1px' }}>PPKS PORTAL</p>
          <h1 style={{ margin: 0, fontSize: '38px' }}>Dashboard Satgas PPKS</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#888', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            {isAdmin ? '🛡️ ADMIN KONTRAK AKTIF' : '💼 ANGGOTA SATGAS AKTIF'}
          </span>
          <code style={styles.satgasBadge}>{account ? `${account.substring(0, 8)}...${account.substring(34)}` : '-'}</code>
        </div>
      </div>

      {/* Panel Administrasi khusus Admin Kontrak */}
      {isAdmin && (
        <div style={styles.adminPanel}>
          <h3 style={{ margin: '0 0 10px', color: '#FFFF2E', fontSize: '18px' }}>🛠️ Kelola Whitelist Satgas (Admin Kontrak)</h3>
          <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 20px', lineHeight: '1.5' }}>
            Sebagai pemilik/deployer kontrak ini, Anda dapat mendaftarkan dompet anggota baru ke dalam whitelist Satgas PPKS agar mereka dapat mengakses dashboard dan memperbarui status kasus.
          </p>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Masukkan alamat wallet Ethereum (0x...)" 
              style={styles.adminInput}
              value={whitelistAddress}
              onChange={(e) => setWhitelistAddress(e.target.value)}
              disabled={adminUpdating}
            />
            <button 
              className="btn-pijar" 
              style={{ ...styles.adminBtn, background: '#27AE60', color: '#fff', border: '1px solid #27AE60' }}
              onClick={() => handleWhitelist(true)}
              disabled={adminUpdating}
            >
              {adminUpdating ? 'Memproses...' : 'Tambah Whitelist'}
            </button>
            <button 
              className="btn-pijar" 
              style={{ ...styles.adminBtn, background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.3)' }}
              onClick={() => handleWhitelist(false)}
              disabled={adminUpdating}
            >
              {adminUpdating ? 'Memproses...' : 'Cabut Akses'}
            </button>
          </div>
        </div>
      )}
      
      {/* Grid Statistik */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Laporan</p>
          <h2 style={styles.statValue}>{stats.total}</h2>
        </div>
        <div style={{ ...styles.statCard, borderTop: `4px solid ${STATUS_COLORS[0]}` }}>
          <p style={styles.statLabel}>Menunggu Tindakan</p>
          <h2 style={styles.statValue}>{stats.submitted}</h2>
        </div>
        <div style={{ ...styles.statCard, borderTop: `4px solid ${STATUS_COLORS[1]}` }}>
          <p style={styles.statLabel}>Sedang Diproses</p>
          <h2 style={styles.statValue}>{stats.underInvestigation}</h2>
        </div>
        <div style={{ ...styles.statCard, borderTop: `4px solid ${STATUS_COLORS[2]}` }}>
          <p style={styles.statLabel}>Kasus Selesai</p>
          <h2 style={styles.statValue}>{stats.resolved}</h2>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterBar}>
        <button 
          style={{ ...styles.filterTab, ...(filterStatus === 'all' ? styles.activeFilterTab : {}) }}
          onClick={() => setFilterStatus('all')}
        >
          Semua Kasus ({reports.length})
        </button>
        <button 
          style={{ ...styles.filterTab, ...(filterStatus === '0' ? styles.activeFilterTab : {}) }}
          onClick={() => setFilterStatus('0')}
        >
          Submitted ({stats.submitted})
        </button>
        <button 
          style={{ ...styles.filterTab, ...(filterStatus === '1' ? styles.activeFilterTab : {}) }}
          onClick={() => setFilterStatus('1')}
        >
          Diproses ({stats.underInvestigation})
        </button>
        <button 
          style={{ ...styles.filterTab, ...(filterStatus === '2' ? styles.activeFilterTab : {}) }}
          onClick={() => setFilterStatus('2')}
        >
          Selesai ({stats.resolved})
        </button>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          ❌ {error}
        </div>
      )}

      {/* Tabel Laporan */}
      <div style={styles.tableWrapper}>
        {filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            Tidak ada laporan dalam kategori ini.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={{ color: '#555', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={styles.th}>ID LAPORAN</th>
                <th style={styles.th}>WALLET PELAPOR</th>
                <th style={styles.th}>TANGGAL MASUK</th>
                <th style={styles.th}>TIPE BUKTI</th>
                <th style={styles.th}>STATUS</th>
                <th style={styles.th}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: 'bold', color: '#FFFF2E' }}>#{report.id}</td>
                  <td style={styles.td}>
                    <code style={styles.code}>{report.reporter.substring(0, 6)}...{report.reporter.substring(38)}</code>
                  </td>
                  <td style={styles.td}>
                    {new Date(report.timestamp * 1000).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.fileTypeBadge}>{report.fileType.split('/')[0] || 'file'}</span>
                  </td>
                  <td style={styles.td}>
                    <span 
                      style={{ 
                        ...styles.status, 
                        background: `${STATUS_COLORS[report.status]}15`, 
                        color: STATUS_COLORS[report.status],
                        border: `1px solid ${STATUS_COLORS[report.status]}30`
                      }}
                    >
                      {STATUS_TEXT[report.status]}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <Link to={`/satgas/detail/${report.id}`} style={{ textDecoration: 'none' }}>
                      <button className="btn-pijar" style={{ padding: '6px 15px', fontSize: '12px' }}>
                        Lihat Detail
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  adminPanel: {
    background: 'rgba(255, 255, 46, 0.02)',
    border: '1px dashed rgba(255, 255, 46, 0.2)',
    padding: '30px',
    borderRadius: '20px',
    marginBottom: '35px'
  },
  adminInput: {
    flex: 1,
    minWidth: '280px',
    padding: '14px 18px',
    background: '#040415',
    color: '#fff',
    border: '1px solid #222',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  adminBtn: {
    padding: '14px 28px',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px'
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '35px' },
  statCard: { 
    background: 'var(--card-bg)', 
    padding: '30px', 
    borderRadius: '16px', 
    border: '1px solid var(--border-white)',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  statLabel: { color: '#888', fontSize: '14px', marginBottom: '10px' },
  statValue: { fontSize: '42px', margin: 0, fontWeight: 'bold' },
  filterBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #222',
    paddingBottom: '15px'
  },
  filterTab: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s'
  },
  activeFilterTab: {
    background: 'rgba(255, 255, 46, 0.1)',
    color: '#FFFF2E',
  },
  tableWrapper: { 
    background: 'var(--card-bg)', 
    borderRadius: '20px', 
    border: '1px solid var(--border-white)', 
    padding: '20px',
    boxShadow: '0 6px 30px rgba(0,0,0,0.3)'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '20px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.02)' },
  tr: { transition: 'background 0.2s', '&:hover': { background: 'rgba(255,255,255,0.01)' } },
  status: { padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' },
  satgasBadge: {
    background: 'rgba(77, 108, 250, 0.15)',
    color: '#4D6CFA',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(77, 108, 250, 0.3)',
    display: 'block',
    marginTop: '5px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  code: {
    background: 'rgba(0,0,0,0.4)',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #222',
    color: '#888',
    fontSize: '13px'
  },
  fileTypeBadge: {
    background: 'rgba(255,255,255,0.05)',
    color: '#bbb',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    textTransform: 'uppercase'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '120px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '45px',
    height: '45px',
    border: '4px solid rgba(255, 255, 46, 0.1)',
    borderTop: '4px solid #FFFF2E',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorAlert: {
    background: 'rgba(255, 77, 77, 0.08)',
    color: '#ff4d4d',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    padding: '15px 20px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold'
  }
};

export default DashboardSatgas;