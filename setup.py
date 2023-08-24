from setuptools import setup, find_packages


with open("README.md") as f:
    readme = f.read()

with open("LICENSE") as f:
    license = f.read()


setup(
    name='administrator',
    version='0.1.0',
    description='All purpose Discord bot',
    long_description=readme,
    author='Ethanell',
    author_email='ethanell@flifloo.fr',
    url='https://git.flifloo.fr/flifloo/Administrator',
    license=license,
    packages=find_packages(exclude=('tests', 'docs'))
)
