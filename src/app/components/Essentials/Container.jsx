const Container = ({ children }) => {
    return (
        <>
            <nav>
                <h1>Mi sitio web</h1>
                <button>
                    menu
                </button>
            </nav>
            <main>
                {children} {/* Aquí se renderizan los elementos que se pasen como hijos */}
            </main>
        </>
    )
}
