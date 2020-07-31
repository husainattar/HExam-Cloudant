import ssl
ssl._create_default_https_context = ssl._create_unverified_context

try:
    from googlesearch import search
except ImportError:
    print("No module named 'google' found")


import sys

# Query we want to search
# query = "This method call enables a fast and efficient way to create new threads in both Linux and Windows.The method call returns immediately and the child thread starts and calls function with the passed list of args. When function returns, the thread terminates.Here, args is a tuple of arguments; use an empty tuple to call function without passing any arguments. kwargs is an optional dictionary of keyword arguments."

query =sys.argv[1]
query=query.split()
query = " ".join(query[:32])

# query="A thread is a lightweighted task"

# Storing the resulted urls to web scrap with.
resulted_urls = []

# Looping over the search response
for j in search(query, tld="co.in", num=1, stop=1, pause=2):
    resulted_urls.append(j)


# import urllib
import requests
from bs4 import BeautifulSoup

url = resulted_urls[0]
# html = urllib.urlopen(url).read()
# soup = BeautifulSoup(html)

r = requests.get(url)
soup = BeautifulSoup(r.content, 'html5lib')

# kill all script and style elements
for script in soup(["script", "style"]):
    script.extract()    # rip it out

# get text
text = soup.get_text()

# break into lines and remove leading and trailing space on each
lines = (line.strip() for line in text.splitlines())

# break multi-headlines into a line each
chunks = (phrase.strip() for line in lines for phrase in line.split("  "))


# Remove/drop blank lines
text = ''.join(chunk for chunk in chunks if chunk)


def lcs(X, Y):
    m = len(X)
    n = len(Y)

    L = [[None] * (n + 1) for i in range(m + 1)]

    for i in range(m + 1):
        for j in range(n + 1):
            if i == 0 or j == 0:
                L[i][j] = 0
            elif X[i - 1] == Y[j - 1]:
                L[i][j] = L[i - 1][j - 1] + 1
            else:
                L[i][j] = max(L[i - 1][j], L[i][j - 1])

                # L[m][n] contains the length of LCS of X[0..n-1] & Y[0..m-1]
    return L[m][n]


# print(len(query))
plagiarism=(lcs(text,query)/len(query))*100
print(plagiarism,url)
