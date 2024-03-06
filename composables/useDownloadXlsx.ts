/* eslint-disable import/no-named-as-default-member */
import Excel, { type Worksheet } from "exceljs";
import FileSaver from "file-saver";
import { splitStringByUnderscore } from "~/helpers/functions";

const { Workbook } = Excel;
const { saveAs } = FileSaver;

function adjustColumnWidth(workSheet: Worksheet) {
	workSheet.columns.forEach((column) => {
		if (column.values) {
			const lengths = column.values.map((v) => v?.toString().length);

			const maxLength = Math.max(
				...(lengths.filter((v) => {
					return typeof v === "number";
				}) as number[]),
			);

			// THE 4 is to add padding
			column.width = maxLength + 4;
		}
	});
}

export async function useDownloadXlsx<T extends object>(data: T[], fileName: string, sheetName?: string) {
	const random = Math.floor(Math.random() * 100000);
	const nameOfSheet = `${sheetName ?? fileName}`;
	const nameOfFile = `${fileName + ' ' +random}.xlsx`;
	const workbook = new Workbook();
	const workSheet = workbook.addWorksheet(nameOfSheet);

	function insertHeaders() {
		const headers = new Set(
			data.reduce((acc, curr) => {
				const keys = Object.keys(curr);
				return acc.concat(keys);
			}, [] as string[]),
		);

		const capitalizedHeaders = [...headers].map((header) => splitStringByUnderscore(header).toUpperCase());

		workSheet.addRow([...capitalizedHeaders]);
		workSheet.eachRow({ includeEmpty: true }, (row) => {
			row.eachCell((cell) => {
				cell.font = {
					bold: true,
					color: { argb: "ffffff" },
				};
				cell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "4472c5" },
				};
			});
		});
	}

	function insertData() {
		data.forEach((d) => {
			const values = Object.values(d);
			workSheet.addRow(values);
		});

		adjustColumnWidth(workSheet);
	}

	insertHeaders();
	insertData();
	const buffer = await workbook.xlsx.writeBuffer();
	saveAs(new Blob([buffer]), nameOfFile);
}
