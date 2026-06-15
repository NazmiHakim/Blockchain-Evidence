import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

/**
 * fungsi untuk mengunggah satu atau banyak file sekaligus ke IPFS Pinata maka akan membundelnya ke dalam satu folder, sehingga menghasilkan 1 CID saja.
 * 
 * @param {File[]} filesArray - Array yang berisi objek File dari browser (yang sudah dienkripsi)
 * @returns {string} CID/Content Identifier tunggal untuk bundel file tersebut
 */
export const uploadToIPFS = async (filesArray) => {
    try {
        if (!filesArray || filesArray.length === 0) {
            throw new Error("Tidak ada file yang dipilih untuk diunggah.");
        }

        const formData = new FormData();

        filesArray.forEach((file) => {
            const fileName = file.name || `bukti_terenkripsi_${Date.now()}.bin`;
            // Trick Pinata into wrapping the files as a directory by prepending 'data/'
            formData.append("file", file, `data/${fileName}`);
        });

        // menambahkan metadata ini opsional, tapi berguna untuk pelacakan di dashboard pinata
        const metadata = JSON.stringify({
            name: `Laporan_Kekerasan_Seksual_${Date.now()}`,
        });
        formData.append("pinataMetadata", metadata);

        // opsi pinata: cid version 1 sangat disarankan untuk direktori
        const pinataOptions = JSON.stringify({
            cidVersion: 1
            // wrapWithDirectory otomatis aktif ketika ada path (data/)
        });
        formData.append("pinataOptions", pinataOptions);

        // eksekusi http request post ke api pinata
        const res = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                maxBodyLength: "Infinity", // mengizinkan file besar dengan prd maks 50 mb
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY,
                },
            }
        );

        console.log("File berhasil dibundel dan diunggah ke IPFS Pinata");
        console.log("CID (Hash) Folder: ", res.data.IpfsHash);
        
        // mengembalikan cid/hashyang nanti akan dikirim ke smart contract
        return res.data.IpfsHash;

    } catch (error) {
        console.error("Gagal mengunggah ke IPFS Pinata: ", error);
        throw error;
    }
};

/**
 * Fungsi utility untuk membangun URL Gateway dari CID
 * @param {string} cid - Content Identifier IPFS
 * @returns {string} URL lengkap yang bisa diakses via browser
 */
export const getIPFSGatewayUrl = (cid) => {
    // Sesuai dengan URL gateway yang dituliskan di dokumen PRD
    return `https://ipfs.io/ipfs/${cid}`;
};