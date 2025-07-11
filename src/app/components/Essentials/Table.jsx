import { TfiTrash } from "react-icons/tfi";
import Checkbox from "./Checkbox"; // Asegúrate de tener este componente
import { RiMenuAddLine } from "react-icons/ri";

export default function Table({ body, columns }) {
    return (
        <div className="w-full overflow-x-hidden bg-white rounded-lg text-gray-700">
            <table className="min-w-full bg-white">
                <thead className="bg-[#282b7e] text-white">
                    <tr>
                        {columns.map((column) => {
                            if (column.key == "date") {
                                return (
                                    <th key={column.key} className="px-6 py-3 text-sm font-semibold border-b text-left">
                                        {column.title}
                                    </th>
                                )
                            } else {
                                return (
                                    <th key={column.key} className="px-6 py-3 text-sm font-semibold border-b text-start">
                                        {column.title}
                                    </th>
                                )
                            }
                        })}
                    </tr>
                </thead>
                <tbody>
                    {body}
                </tbody>
            </table>
        </div>
    );
}
