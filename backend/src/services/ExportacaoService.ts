import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { RelatorioInadimplentes, RelatorioConsultas, RelatorioDividas } from '../models/Relatorio';
import { formatCurrency } from '../utils/formatters';
import { Cliente } from '../models/Cliente';
import { Divida } from '../models/Divida';
import { Consulta } from '../models/Consulta';

export class ExportacaoService {
  async exportarInadimplentesPDF(relatorio: RelatorioInadimplentes): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Inadimplentes', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Total de Inadimplentes: ${relatorio.totalInadimplentes}`);
      doc.text(`Valor Total das Dívidas: ${formatCurrency(relatorio.valorTotalDividas)}`);
      doc.moveDown();

      // Tabela de Inadimplentes
      relatorio.inadimplentes.forEach((inadimplente) => {
        doc.fontSize(14).text(`Cliente: ${inadimplente.cliente.nome}`);
        doc.fontSize(12).text(`CPF: ${inadimplente.cliente.cpf}`);
        doc.text(`Telefone: ${inadimplente.cliente.telefone}`);
        doc.moveDown();

        doc.text('Dívidas:');
        inadimplente.dividas.forEach((divida) => {
          doc.text(`- ${divida.descricao}: ${formatCurrency(divida.valor)} (Vencimento: ${divida.data?.toLocaleDateString() || 'N/A'})`);
        });
        doc.moveDown();
      });

      doc.end();
    });
  }

  async exportarConsultasPDF(relatorio: RelatorioConsultas): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Consultas', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Total de Consultas: ${relatorio.totalConsultas}`);
      doc.moveDown();

      // Gráfico de Consultas por Período
      doc.text('Consultas por Período:');
      relatorio.consultasPorPeriodo.forEach((periodo) => {
        doc.text(`${periodo.data.toLocaleDateString()}: ${periodo.quantidade} consultas`);
      });
      doc.moveDown();

      // Lista de Consultas
      doc.text('Detalhamento das Consultas:');
      relatorio.consultas.forEach((consulta) => {
        doc.text(`CPF: ${consulta.cpf_consultado}`);
        doc.text(`Data: ${consulta.data_consulta?.toLocaleDateString() || 'N/A'}`);
        doc.text(`Resultado: ${consulta.resultado}`);
        doc.moveDown();
      });

      doc.end();
    });
  }

  async exportarDividasPDF(relatorio: RelatorioDividas): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Dívidas', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Total de Dívidas: ${relatorio.totalDividas}`);
      doc.text(`Valor Total: ${formatCurrency(relatorio.valorTotal)}`);
      doc.moveDown();

      // Status das Dívidas
      doc.text('Dívidas por Status:');
      Object.entries(relatorio.dividasPorStatus).forEach(([status, quantidade]) => {
        doc.text(`${status}: ${quantidade}`);
      });
      doc.moveDown();

      // Lista de Dívidas
      doc.text('Detalhamento das Dívidas:');
      relatorio.dividas.forEach((divida) => {
        doc.text(`Descrição: ${divida.descricao}`);
        doc.text(`Valor: ${formatCurrency(divida.valor)}`);
        doc.text(`Vencimento: ${divida.data?.toLocaleDateString() || 'N/A'}`);
        doc.text(`Status: ${divida.status}`);
        doc.moveDown();
      });

      doc.end();
    });
  }

  async exportarInadimplentesExcel(relatorio: RelatorioInadimplentes): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inadimplentes');

    // Cabeçalho
    worksheet.columns = [
      { header: 'Nome', key: 'nome', width: 30 },
      { header: 'CPF', key: 'cpf', width: 15 },
      { header: 'Telefone', key: 'telefone', width: 15 },
      { header: 'Valor Total', key: 'valorTotal', width: 15 },
      { header: 'Última Consulta', key: 'ultimaConsulta', width: 20 }
    ];

    // Dados
    relatorio.inadimplentes.forEach((inadimplente) => {
      worksheet.addRow({
        nome: inadimplente.cliente.nome,
        cpf: inadimplente.cliente.cpf,
        telefone: inadimplente.cliente.telefone,
        valorTotal: inadimplente.dividas.reduce((sum, d) => sum + d.valor, 0),
        ultimaConsulta: inadimplente.ultimaConsulta?.data_consulta?.toLocaleDateString() || 'N/A'
      });
    });

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }

  async exportarConsultasExcel(relatorio: RelatorioConsultas): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Consultas');

    // Cabeçalho
    worksheet.columns = [
      { header: 'Data', key: 'data', width: 15 },
      { header: 'CPF Consultado', key: 'cpf', width: 15 },
      { header: 'Resultado', key: 'resultado', width: 30 }
    ];

    // Dados
    relatorio.consultas.forEach((consulta) => {
      worksheet.addRow({
        data: consulta.data_consulta?.toLocaleDateString() || 'N/A',
        cpf: consulta.cpf_consultado,
        resultado: consulta.resultado
      });
    });

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }

  async exportarDividasExcel(relatorio: RelatorioDividas): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dívidas');

    // Cabeçalho
    worksheet.columns = [
      { header: 'Descrição', key: 'descricao', width: 30 },
      { header: 'Valor', key: 'valor', width: 15 },
      { header: 'Vencimento', key: 'vencimento', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Dados
    relatorio.dividas.forEach((divida) => {
      worksheet.addRow({
        descricao: divida.descricao,
        valor: divida.valor,
        vencimento: divida.data?.toLocaleDateString() || 'N/A',
        status: divida.status
      });
    });

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }

  static async exportarCliente(cliente: Cliente, dividas: Divida[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Cliente', { align: 'center' });
      doc.moveDown();

      // Dados do Cliente
      doc.fontSize(16).text('Dados do Cliente');
      doc.fontSize(12);
      doc.text(`Nome: ${cliente.nome}`);
      doc.text(`CPF: ${cliente.cpf}`);
      if (cliente.email) doc.text(`Email: ${cliente.email}`);
      if (cliente.telefone) doc.text(`Telefone: ${cliente.telefone}`);
      if (cliente.endereco) doc.text(`Endereço: ${cliente.endereco}`);
      doc.text(`Status: ${cliente.status}`);
      doc.moveDown();

      // Dívidas
      if (dividas.length > 0) {
        doc.fontSize(16).text('Dívidas');
        doc.fontSize(12);
        dividas.forEach(divida => {
          doc.text(`- ${divida.descricao}: ${formatCurrency(divida.valor)} (Vencimento: ${divida.data_vencimento?.toLocaleDateString() || 'N/A'})`);
        });
      }

      doc.end();
    });
  }

  static async exportarConsulta(consulta: Consulta): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Consulta', { align: 'center' });
      doc.moveDown();

      // Dados da Consulta
      doc.fontSize(16).text('Detalhes da Consulta');
      doc.fontSize(12);
      doc.text(`Data: ${consulta.data?.toLocaleDateString() || 'N/A'}`);
      doc.text(`Tipo: ${consulta.tipo}`);
      if (consulta.observacoes) doc.text(`Observações: ${consulta.observacoes}`);

      doc.end();
    });
  }

  static async exportarInadimplentes(inadimplentes: any[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Inadimplentes', { align: 'center' });
      doc.moveDown();

      // Lista de Inadimplentes
      inadimplentes.forEach(inadimplente => {
        doc.fontSize(16).text(`Cliente: ${inadimplente.cliente.nome}`);
        doc.fontSize(12);
        doc.text(`CPF: ${inadimplente.cliente.cpf}`);
        doc.text(`Telefone: ${inadimplente.cliente.telefone}`);
        doc.text(`Status: ${inadimplente.cliente.status}`);
        doc.moveDown();

        doc.text('Dívidas:');
        inadimplente.dividas.forEach((divida: Divida) => {
          doc.text(`- ${divida.descricao}: ${formatCurrency(divida.valor)}`);
          doc.text(`  Vencimento: ${divida.data_vencimento?.toLocaleDateString() || 'N/A'}`);
        });

        if (inadimplente.ultimaConsulta) {
          doc.moveDown();
          doc.text('Última Consulta:');
          doc.text(`Data: ${inadimplente.ultimaConsulta.data?.toLocaleDateString() || 'N/A'}`);
          doc.text(`Tipo: ${inadimplente.ultimaConsulta.tipo}`);
        }

        doc.moveDown(2);
      });

      doc.end();
    });
  }

  static async exportarConsultas(consultas: Consulta[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Consultas', { align: 'center' });
      doc.moveDown();

      // Lista de Consultas
      consultas.forEach(consulta => {
        doc.fontSize(16).text(`Consulta #${consulta.id}`);
        doc.fontSize(12);
        doc.text(`Data: ${consulta.data?.toLocaleDateString() || 'N/A'}`);
        doc.text(`Tipo: ${consulta.tipo}`);
        if (consulta.observacoes) doc.text(`Observações: ${consulta.observacoes}`);
        doc.moveDown(2);
      });

      doc.end();
    });
  }

  static async exportarDividas(dividas: Divida[]): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Dívidas', { align: 'center' });
      doc.moveDown();

      // Lista de Dívidas
      dividas.forEach(divida => {
        doc.fontSize(16).text(`Dívida #${divida.id}`);
        doc.fontSize(12);
        doc.text(`Valor: ${formatCurrency(divida.valor)}`);
        doc.text(`Vencimento: ${divida.data_vencimento?.toLocaleDateString() || 'N/A'}`);
        if (divida.descricao) doc.text(`Descrição: ${divida.descricao}`);
        doc.text(`Status: ${divida.status}`);
        doc.moveDown(2);
      });

      doc.end();
    });
  }
} 