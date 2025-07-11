export default function AlertError({ message, isOpen, onClose }) {
    return (
        <div onClick={onClose} className={`${isOpen?'fixed':'hidden'} fixed top-0 left-0 bottom-0 right-0 bg-red-500 z-50 flex justify-center items-center text-white animate-pulse`}>
            <h2 className="text-2xl font-semibold">{message}</h2>
        </div>
    )

}