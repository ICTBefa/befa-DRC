nodeoutlook = require('nodejs-nodemailer-outlook');

nodeoutlook.sendEmail({
    auth: {
        user: "approval.system@befa.id",
        pass: "@Befa2021"
    },
    from: 'approval.system@befa.id',
    to: 'approval.system@befa.id, ivan.halim@befa.id', // 'approval.system@befa.id, ivan.halim@befa.id'
    subject: 'Menunggu Persetujuan PICA',
    html: 
    '<div class="card border border-dark">\
                <table class="center" style="border: 1px solid #333; margin: 50px auto; width: 750px;">\
                    <td>\
                        <p style="text-align:center;">Reminder Verifikasi PICA <data pica> <datahari> hari sebelum Verifikasi</p>\
                        <p>Tgl PICA dibuat : </p>\
                        <p>Dibuat Oleh : </p>\
                        <p style="text-align:center">Deskripsi Masalah</p>\
                            <table style="border: 1px solid black; border-collapse: collapse; margin: 50px auto; width: 750px;">\
                                <td>easdead <br> asdad </td>\
                            </table>\
                        <p style="text-align:center">Akar Masalah</p>\
                            <table style="border: 1px solid black; border-collapse: collapse; margin: 50px auto; width: 750px;">\
                                <td>easdead <br> asdad </td>\
                            </table>\
                        <p style="text-align:center">Tindakan</p>\
                            <table style="border: 1px solid black; border-collapse: collapse; margin: 50px auto; width: 750px;">\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="border: 1px solid black">No</th>\
                                    <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                    <th style="border: 1px solid black">PIC</th>\
                                    <th style="border: 1px solid black">Batas Waktu</th>\
                                </tr>\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <td style="border: 1px solid black">1</td>\
                                    <td style="border: 1px solid black">1234</td>\
                                    <td style="border: 1px solid black">12345</td>\
                                    <td style="border: 1px solid black">123456</td>\
                                </tr>\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <td style="border: 1px solid black">2</td>\
                                    <td style="border: 1px solid black">1234</td>\
                                    <td style="border: 1px solid black">12345</td>\
                                    <td style="border: 1px solid black">123456</td>\
                                </tr>\
                                <tr style="border: 1px; text-align: center">\
                                    <td style="border: 1px solid black">3</td>\
                                    <td style="border: 1px solid black">1234</td>\
                                    <td style="border: 1px solid black">12345</td>\
                                    <td style="border: 1px solid black">123456</td>\
                                </tr>\
                            </table>\
                        <p style="text-align:center">Verikasi</p>\
                            <table style="border: 1px solid black; border-collapse: collapse; margin: 50px auto; width: 750px;">\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="text-align: center" colspan="3">Verifikasi 1</th>\
                                </tr>\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="border: 1px solid black">Rencana Verifikasi</th>\
                                    <th style="border: 1px solid black">Tanggal Verifikasi</th>\
                                    <th style="border: 1px solid black">Diverifikasi oleh </th>\
                                </tr>\
                                <tr style="border: 1px; text-align: center">\
                                    <td style="border: 1px solid black">3</td>\
                                    <td style="border: 1px solid black">1234</td>\
                                    <td style="border: 1px solid black">12345</td>\
                                </tr>\
                                <tr>\
                                    <td>Catatan Verifikasi 1 : asdasdas <br>asdsa</td>\
                                </tr>\
                            </tabel>\
                            <table style="border: 1px solid black; border-collapse: collapse; margin: 50px auto; width: 750px;">\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="text-align: center" colspan="3">Verifikasi 2</th>\
                                </tr>\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="border: 1px solid black">Rencana Verifikasi</th>\
                                    <th style="border: 1px solid black">Tanggal Verifikasi</th>\
                                    <th style="border: 1px solid black">Diverifikasi oleh </th>\
                                </tr>\
                                <tr style="border: 1px; text-align: center">\
                                    <td style="border: 1px solid black">3</td>\
                                    <td style="border: 1px solid black">1234</td>\
                                    <td style="border: 1px solid black">12345</td>\
                                </tr>\
                                <tr>\
                                    <td>Catatan Verifikasi 2 : asdasdas <br>asdsa</td>\
                                </tr>\
                            </tabel>\
                            <table style="border: 1px solid black; border-collapse: collapse; margin: 50px auto; width: 750px;">\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="text-align: center" colspan="3">Verifikasi 3</th>\
                                </tr>\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="border: 1px solid black">Rencana Verifikasi</th>\
                                    <th style="border: 1px solid black">Tanggal Verifikasi</th>\
                                    <th style="border: 1px solid black">Diverifikasi oleh </th>\
                                </tr>\
                                <tr style="border: 1px; text-align: center">\
                                    <td style="border: 1px solid black">3</td>\
                                    <td style="border: 1px solid black">1234</td>\
                                    <td style="border: 1px solid black">12345</td>\
                                </tr>\
                                <tr>\
                                    <td>Catatan Verifikasi 3 : asdasdas <br>asdsa</td>\
                                </tr>\
                            </tabel>\
                    </td>\
            </div>',
    onError: (e) => console.log(e),
    onSuccess: (i) => console.log(i)
});
