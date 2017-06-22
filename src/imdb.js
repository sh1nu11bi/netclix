import Horseman from 'node-horseman';

export const get = async (search) => {
    return await new Horseman().open(`http://www.imdb.com/find?q=${search}&s=tt&ttype=ft`)
        .evaluate(() => {
            const movies = [].slice.call(document.querySelectorAll('.result_text a')).slice(0, 10);
            return movies.map(movie => ({
                name: movie.text,
                value: movie.href.match(/tt[0-9]+/)[0],
            }));
        })
        .close();
};
