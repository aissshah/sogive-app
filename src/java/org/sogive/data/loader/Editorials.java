package org.sogive.data.loader;

import java.util.Arrays;
import java.util.Collection;
import java.util.Iterator;

public class Editorials implements Iterable<Editorial> {
    private final Collection<Editorial> charityEditorials;

    public Editorials(Collection<Editorial> charityEditorials) {
        this.charityEditorials = charityEditorials;
    }

    public Editorials(Editorial... charityEditorials) {
        this.charityEditorials = Arrays.asList(charityEditorials.clone());
    }

    @Override
    public Iterator<Editorial> iterator() {
        return charityEditorials.iterator();
    }

    public String getEditorial(String charityId) {
        return charityEditorials.stream()
                .filter(editorial -> editorial.getCharityId().equals(charityId))
                .findFirst()
                .map(Editorial::getEditorialText)
                .orElse(null);
    }
}
