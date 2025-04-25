import 'bootstrap/dist/css/bootstrap.min.css';
import './game.css';

function App() {
    return (
        <>
            <nav className="navbar sticky-top bg-body-secondary">Settings</nav>
            <main className="container-fluid d-flex flex-row flex-nowrap gap-2 pt-2">
                <div className="col">
                    <article className="card" id="text-multiple-choice">
                        <div className="card-header">
                            <span part="section">Section</span>
                            <span part="points">100</span>
                        </div>
                        <section className="card-body">
                            <h3 part="question-text" className="card-title mb-4">Question?</h3>
                            <div part="answer-choices" className="answers-grid gap-2">
                                <div className="answer align-items-baseline gap-2">
                                    <button part="choice-id" type="button" className="btn btn-primary btn-lg">A</button>
                                    <span part="choice-text">Test</span>
                                </div>
                            </div>
                        </section>
                    </article>
                </div>
            </main>
            <nav id="teams-container" className="navbar fixed-bottom bg-body-secondary">
            </nav>
        </>
    );
}

export default App;
