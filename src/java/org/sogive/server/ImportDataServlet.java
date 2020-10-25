package org.sogive.server;

import org.sogive.data.loader.*;

import com.winterwell.web.WebEx;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.SField;

public class ImportDataServlet implements IServlet {

	private static ImportOSCRData oscr;
	private static ImportEditorialsDataTask importEditorialsTask;

	@Override
	public void process(WebRequest state) throws Exception {
		String dataset = state.getRequired(new SField("dataset"));
		if ("OSCR".equals(dataset)) {
			oscr = new ImportOSCRData();
			if (oscr.isRunning()) {
				throw new WebEx.E400("Repeat call");
			}
			oscr.run();
		}
		if ("editorials".equals(dataset)) {
			String url = state.get("url");
			JsoupDocumentFetcher jsoupDocumentFetcher = new JsoupDocumentFetcherImpl();
			DatabaseWriter databaseWriter = new ElasticSearchDatabaseWriter();
			importEditorialsTask = new ImportEditorialsDataTask(jsoupDocumentFetcher, databaseWriter);
			if (importEditorialsTask.isRunning()) {
				throw new WebEx.E400("Repeat call");
			}
			importEditorialsTask.run(url);
		}
	}

}
